const db = require('../configs/pg')

const baseSelect = `
  SELECT
    p.opg_id          AS id,
    p.ord_id          AS ord_id,
    p.fpg_id          AS fpg_id,
    p.opg_valor       AS valor,
    p.opg_parcela     AS parcela,
    p.opg_vencimento  AS vencimento,
    p.opg_pago        AS pago,
    o.ord_id          AS ordem_id,
    o.ord_data        AS ordem_data, 
    cl.cli_id         AS cli_id,
    cl.cli_nome       AS cliente_nome,
    f.fpg_nome        AS forma_pagamento_nome,
    f.fpg_parcelado   AS forma_pagamento_parcelado
  FROM t_ordpag p
  JOIN t_ordem    o  ON p.ord_id = o.ord_id
  JOIN t_cliente  cl ON o.cli_id = cl.cli_id
  JOIN t_formapag f  ON p.fpg_id = f.fpg_id
`

const sql_getById = `
  ${baseSelect}
  WHERE p.opg_id = $1
`

const sql_getAll = `
  ${baseSelect}
  ORDER BY p.opg_id DESC
`

const sql_post = `
  INSERT INTO t_ordpag
    (ord_id, fpg_id, opg_valor, opg_parcela, opg_vencimento, opg_pago)
  VALUES
    ($1, $2, $3, $4, $5, COALESCE($6, 'N'))
  RETURNING opg_id AS id
`

const sql_put = `
  UPDATE t_ordpag
     SET ord_id         = $2,
         fpg_id         = $3,
         opg_valor      = $4,
         opg_parcela    = $5,
         opg_vencimento = $6,
         opg_pago       = COALESCE($7, 'N')
   WHERE opg_id         = $1
RETURNING opg_id AS id
`

const sql_delete = `
  DELETE FROM t_ordpag
   WHERE opg_id = $1
RETURNING opg_id AS id
`

const getOrdPagById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) throw new Error('NotFound')
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Pagamento da OS não encontrado' }
    }
    throw { status: 500, message: 'Erro ao buscar Pagamento da OS ' + err.message }
  }
}

const getOrdPags = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Pagamentos da OS ' + err.message }
  }
}

const postOrdPag = async (params) => {
  try {
    const { ord_id, fpg_id } = params
    const totalParcelas = Number(params.parcela) || 1
    const totalValor = Number(params.valor)
    const pagoFlag = (params.pago ?? 'N')
    const baseVenc = new Date(params.vencimento)

    if (!Number.isFinite(totalValor) || totalValor <= 0) {
      throw { status: 400, message: 'Valor inválido' }
    }
    if (!Number.isInteger(totalParcelas) || totalParcelas <= 0) {
      throw { status: 400, message: 'Quantidade de parcelas inválida' }
    }
    if (isNaN(baseVenc.getTime())) {
      throw { status: 400, message: 'Data de vencimento inválida' }
    }

    // valida FK: ordem
    const ordem = await db.query('SELECT ord_id FROM t_ordem WHERE ord_id = $1', [ord_id])
    if (ordem.rows.length === 0) throw { status: 400, message: 'Ordem informada não existe' }

    // valida FK: forma de pagamento + regra de parcelamento
    const fpg = await db.query('SELECT fpg_id, fpg_parcelado FROM t_formapag WHERE fpg_id = $1', [fpg_id])
    if (fpg.rows.length === 0) throw { status: 400, message: 'Forma de Pagamento informada não existe' }
    if (totalParcelas > 1 && fpg.rows[0].fpg_parcelado !== 'S') {
      throw { status: 400, message: 'Esta forma de pagamento não permite parcelamento' }
    }

    // --- Faz o ajuste fino dos valores para evitar erros de arredondamento
    const totalCents = Math.round(totalValor * 100)
    const baseParcelaCents = Math.floor(totalCents / totalParcelas)
    const restoCents = totalCents - baseParcelaCents * totalParcelas

    const addDays = (d, days) => {
      const nd = new Date(d.getTime())
      nd.setDate(nd.getDate() + days)
      return nd
    }

    const values = []
    const binds = []
    let p = 0
    for (let i = 1; i <= totalParcelas; i++) {
      const parcelaCents = baseParcelaCents + (i <= restoCents ? 1 : 0)
      const valorParcela = parcelaCents / 100
      const dtVenc = addDays(baseVenc, 30 * (i - 1))

      values.push(`($${++p}, $${++p}, $${++p}, $${++p}, $${++p}, $${++p})`)
      binds.push(ord_id, fpg_id, valorParcela, i, dtVenc, pagoFlag)
    }

    const sqlMultiInsert = `
      INSERT INTO t_ordpag
        (ord_id, fpg_id, opg_valor, opg_parcela, opg_vencimento, opg_pago)
      VALUES
        ${values.join(', ')}
      RETURNING opg_id AS id
    `

    const result = await db.query(sqlMultiInsert, binds)

    return {
      mensagem: 'Pagamentos da OS criados com sucesso!',
      ids: result.rows.map(r => r.id),
      parcelas: totalParcelas
    }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao tentar criar Pagamento da OS ' + err.message }
  }
}

const putOrdPag = async (params) => {
  try {
    const { id, ord_id, fpg_id, valor, parcela, vencimento, pago } = params

    // valida FK: ordem
    const ordem = await db.query('SELECT ord_id FROM t_ordem WHERE ord_id = $1', [ord_id])
    if (ordem.rows.length === 0) throw { status: 400, message: 'Ordem informada não existe' }

    // valida FK: forma de pagamento
    const fpg = await db.query('SELECT fpg_id FROM t_formapag WHERE fpg_id = $1', [fpg_id])
    if (fpg.rows.length === 0) throw { status: 400, message: 'Forma de Pagamento informada não existe' }

    const result = await db.query(sql_put, [id, ord_id, fpg_id, valor, parcela, vencimento, pago])
    if (result.rows.length === 0) throw new Error('Pagamento da OS não encontrado')

    return { mensagem: 'Pagamento da OS atualizado com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const patchOrdPag = async (params) => {
  try {
    const { id } = params
    let fields = []
    let binds  = [id]
    let count  = 1

    if (params.ord_id !== undefined) {
      const ordem = await db.query('SELECT ord_id FROM t_ordem WHERE ord_id = $1', [params.ord_id])
      if (ordem.rows.length === 0) throw { status: 400, message: 'Ordem informada não existe' }
      count++; fields.push(`ord_id = $${count}`); binds.push(params.ord_id)
    }

    if (params.fpg_id !== undefined) {
      const fpg = await db.query('SELECT fpg_id FROM t_formapag WHERE fpg_id = $1', [params.fpg_id])
      if (fpg.rows.length === 0) throw { status: 400, message: 'Forma de Pagamento informada não existe' }
      count++; fields.push(`fpg_id = $${count}`); binds.push(params.fpg_id)
    }

    if (params.valor !== undefined)      { count++; fields.push(`opg_valor = $${count}`);      binds.push(params.valor) }
    if (params.parcela !== undefined)    { count++; fields.push(`opg_parcela = $${count}`);    binds.push(params.parcela) }
    if (params.vencimento !== undefined) { count++; fields.push(`opg_vencimento = $${count}`); binds.push(params.vencimento) }
    if (params.pago !== undefined)       { count++; fields.push(`opg_pago = $${count}`);       binds.push(params.pago) }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' }
    }

    const sql = `
      UPDATE t_ordpag
         SET ${fields.join(', ')}
       WHERE opg_id = $1
   RETURNING opg_id AS id
    `
    const result = await db.query(sql, binds)
    if (result.rows.length === 0) throw new Error('Pagamento da OS não encontrado')

    return { mensagem: 'Pagamento da OS atualizado com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const deleteOrdPag = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) throw new Error('Pagamento da OS não encontrado')
    return { mensagem: 'Pagamento da OS deletado com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

function apenasDigitos(s) { return String(s || '').replace(/\D+/g, '') }

// DDI + DDD + FONE do cliente só com dígitos
const TELEFONE_COL_DIGITOS = `
  regexp_replace(
    coalesce(cl.cli_ddi, '') || coalesce(cl.cli_ddd, '') || coalesce(cl.cli_fone, ''),
    '\\D', '', 'g'
  )
`;

const getOrdPagsPorTelefone = async ({ telefone, pago }) => {
  try {
    const fone = apenasDigitos(telefone)
    if (!fone) throw { status: 400, message: 'Telefone inválido' }

    let sql = `
      ${baseSelect}
      WHERE ${TELEFONE_COL_DIGITOS} = $1
    `
    const binds = [ fone ]

    if (pago === 'S' || pago === 'N') {
      sql += ` AND p.opg_pago = $2`
      binds.push(pago)
    }

    sql += ` ORDER BY p.opg_vencimento DESC NULLS LAST, p.opg_id DESC`

    const result = await db.query(sql, binds)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao buscar Pagamentos por telefone ' + err.message }
  }
}

/** Soma dos valores por telefone + pago/pendente */
const getSomaOrdPagsPorTelefone = async ({ telefone, pago }) => {
  try {
    const fone = apenasDigitos(telefone)
    if (!fone) throw { status: 400, message: 'Telefone inválido' }

    let sql = `
      SELECT COALESCE(SUM(p.opg_valor), 0) AS total
      FROM t_ordpag p
      JOIN t_ordem   o  ON p.ord_id = o.ord_id
      JOIN t_cliente cl ON o.cli_id = cl.cli_id
      WHERE ${TELEFONE_COL_DIGITOS} = $1
    `
    const binds = [ fone ]

    if (pago === 'S' || pago === 'N') {
      sql += ` AND p.opg_pago = $2`
      binds.push(pago)
    }

    const result = await db.query(sql, binds)
    return Number(result.rows[0]?.total || 0)
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao somar Pagamentos por telefone ' + err.message }
  }
}

module.exports = {
  getOrdPagById,
  getOrdPags,
  postOrdPag,
  putOrdPag,
  patchOrdPag,
  deleteOrdPag,
  getOrdPagsPorTelefone,
  getSomaOrdPagsPorTelefone
}
