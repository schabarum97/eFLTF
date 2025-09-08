const db = require('../configs/pg')

async function ufExiste (uf_id) {
  const r = await db.query('SELECT 1 FROM t_uf WHERE uf_id = $1', [uf_id])
  return r.rows.length > 0
}

async function cidadeDuplicada({ nome, uf_id }) {
  const sql = `
    SELECT 1 FROM t_cidade WHERE uf_id = $1 AND lower(cid_nome) = lower($2) LIMIT 1 `;
  const { rows } = await db.query(sql, [uf_id, (nome ?? '').trim()]);
  return rows.length > 0;
}

const baseSelect = `
  SELECT
    c.cid_id   AS id,
    c.cid_nome AS nome,
    c.cid_deslocamento AS deslocamento,
    c.uf_id    AS uf_id,
    u.uf_nome  AS uf_nome,
    u.uf_sigla AS uf_sigla
  FROM t_cidade c
  JOIN t_uf u ON c.uf_id = u.uf_id`;

const sql_getById = `
  ${baseSelect}
  WHERE c.cid_id = $1`;

const sql_getAll = `
  ${baseSelect}
  ORDER BY u.uf_sigla, c.cid_nome ASC`;

const sql_post = `
  INSERT INTO t_cidade (cid_nome, uf_id, cid_deslocamento)
  VALUES ($1, $2, $3)
  RETURNING cid_id AS id
`

const sql_put = `
  UPDATE t_cidade
     SET cid_nome = $2,
         uf_id    = $3, 
         cid_deslocamento = $4
   WHERE cid_id   = $1
RETURNING cid_id AS id
`

const sql_delete = `
  DELETE FROM t_cidade
   WHERE cid_id = $1
RETURNING cid_id AS id
`

const getCidadeById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) throw new Error('NotFound')
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Cidade não encontrada' }
    }
    throw { status: 500, message: 'Erro ao buscar Cidade ' + err.message }
  }
}

const getCidades = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Cidades ' + err.message }
  }
}

const postCidade = async (params) => {
  try {
    let { nome, uf_id, deslocamento } = params

    if (!(await ufExiste(uf_id))) {
      throw { status: 400, message: 'UF informada não existe' }
    }

    if (await cidadeDuplicada({ nome, uf_id })) {
      throw { status: 409, message: 'Já existe uma cidade com esse nome para essa UF' }
    }

    const result = await db.query(sql_post, [nome.trim(), uf_id, deslocamento])
    return { mensagem: 'Cidade criada com sucesso!', id: result.rows[0].id }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao tentar criar Cidade ' + err.message }
  }
}

const putCidade = async (params) => {
  try {
    const { id } = params
    let { nome, uf_id, deslocamento } = params

    if (!(await ufExiste(uf_id))) {
      throw { status: 400, message: 'UF informada não existe' }
    }

    if (await cidadeDuplicada({ nome, uf_id})) {
      throw { status: 409, message: 'Já existe uma cidade com esse nome para essa UF' }
    }

    const result = await db.query(sql_put, [id, nome.trim(), uf_id, deslocamento])
    if (result.rows.length === 0) throw new Error('Cidade não encontrada')
    return { mensagem: 'Cidade atualizada com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const patchCidade = async (params) => {
  try {
    const { id } = params

    const atual = await db.query('SELECT cid_nome, uf_id FROM t_cidade WHERE cid_id = $1', [id])
    if (atual.rows.length === 0) throw { status: 404, message: 'Cidade não encontrada' }
    const atualRow = atual.rows[0]

    const alvoNome = params.nome !== undefined ? params.nome : atualRow.cid_nome
    const alvoUfId = params.uf_id !== undefined ? params.uf_id : atualRow.uf_id

    if (params.uf_id !== undefined && !(await ufExiste(params.uf_id))) {
      throw { status: 400, message: 'UF informada não existe' }
    }

    const mudouNome = params.nome !== undefined && alvoNome !== atualRow.cid_nome
    const mudouUf   = params.uf_id !== undefined && params.uf_id !== atualRow.uf_id
    if (mudouNome || mudouUf) {
      if (await cidadeDuplicada({ nome: alvoNome, uf_id: alvoUfId})) {
        throw { status: 409, message: 'Já existe uma cidade com esse nome para essa UF' }
      }
    }

    let fields = []
    let binds = [id]
    let count = 1

    if (params.nome !== undefined) {
      count++
      fields.push(`cid_nome = $${count}`)
      binds.push(alvoNome.trim())
    }

    if (params.uf_id !== undefined) {
      count++
      fields.push(`uf_id = $${count}`)
      binds.push(alvoUfId)
    }

    if (params.deslocamento !== undefined) {
      count++
      fields.push(`cid_deslocamento = $${count}`)
      binds.push(params.deslocamento)
    }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' }
    }

    const sql = `
      UPDATE t_cidade
         SET ${fields.join(', ')}
       WHERE cid_id = $1
   RETURNING cid_id AS id
    `
    const result = await db.query(sql, binds)
    if (result.rows.length === 0) throw new Error('Cidade não encontrada')

    return { mensagem: 'Cidade atualizada com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const deleteCidade = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) throw new Error('Cidade não encontrada')
    return { mensagem: 'Cidade deletada com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

module.exports = {
  getCidadeById,
  getCidades,
  postCidade,
  putCidade,
  patchCidade,
  deleteCidade
}
