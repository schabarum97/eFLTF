const db = require('../configs/pg')

const baseSelect = `
  SELECT
    o.ord_id            AS id,
    o.cli_id            AS cli_id,
    cl.cli_nome         AS cliente_nome,
    o.end_id            AS end_id,
    e.cli_logradouro    AS end_logradouro,
    e.cli_numero        AS end_numero,
    e.cli_bairro        AS end_bairro,
    e.cli_cep           AS end_cep,
    c.cid_id            AS cid_id,
    c.cid_nome          AS cidade_nome,
    uf.uf_sigla         AS uf_sigla,
    uf.uf_nome          AS uf_nome,
    o.stt_id            AS stt_id,
    st.stt_nome         AS status_nome,
    st.stt_cor          AS status_cor,
    o.ord_observacao    AS observacao,
    o.ord_data          AS data,
    o.ord_hora          AS hora,
    o.ord_responsavel   AS responsavel_id,
    us.usu_nome         AS responsavel_nome,
    o.vei_id            AS vei_id,
    v.vei_placa         AS veiculo_placa,
    v.vei_modelo        AS veiculo_modelo
  FROM t_ordem o
  JOIN t_cliente   cl ON o.cli_id = cl.cli_id
  JOIN t_endercli  e  ON o.end_id = e.end_id
  JOIN t_cidade    c  ON e.cid_id = c.cid_id
  JOIN t_uf        uf ON c.uf_id  = uf.uf_id
  JOIN t_status    st ON o.stt_id = st.stt_id
  LEFT JOIN t_usuresponsavel us ON o.ord_responsavel = us.usu_id
  LEFT JOIN t_veiculo v ON o.vei_id = v.vei_id`;
const sql_getById = `
  ${baseSelect}
  WHERE o.ord_id = $1`;

const sql_getAll = `
  ${baseSelect}
  ORDER BY o.ord_id ASC`;

const sql_post = `
  INSERT INTO t_ordem (
    cli_id, end_id, stt_id, ord_observacao, ord_data, ord_hora, ord_responsavel, vei_id) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING ord_id AS id`;

const sql_put = `
  UPDATE t_ordem
     SET cli_id = $2,
         end_id = $3,
         stt_id = $4,
         ord_observacao = $5,
         ord_data = $6,
         ord_hora = $7,
         ord_responsavel = $8,
         vei_id = $9
   WHERE ord_id = $1
RETURNING ord_id AS id`;

const sql_deletepag = `
  DELETE FROM t_ordpag
   WHERE ord_id = $1`;

const sql_delete = `
  DELETE FROM t_ordem
   WHERE ord_id = $1
RETURNING ord_id AS id`;

const getOrdemById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) {
      throw new Error('NotFound')
    }
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Ordem não encontrada' }
    }
    throw { status: 500, message: 'Erro ao buscar Ordem ' + err.message }
  }
}

const getOrdens = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Ordens ' + err.message }
  }
}

const postOrdem = async (params) => {
  try {
    const {
      cli_id,
      end_id,
      stt_id,
      observacao = null,
      data = null,
      hora = null,
      usu_id = null,
      vei_id = null
    } = params

    // ===== validações de FK =====
    // Cliente
    const vCli = await db.query('SELECT cli_id FROM t_cliente WHERE cli_id = $1', [cli_id])
    if (vCli.rows.length === 0) {
      throw { status: 400, message: 'Cliente informado não existe' }
    }

    // Endereço
    const vEnd = await db.query('SELECT end_id, cli_id FROM t_endercli WHERE end_id = $1', [end_id])
    if (vEnd.rows.length === 0) {
      throw { status: 400, message: 'Endereço informado não existe' }
    }

    // Endereço pertence ao cliente?
    if (Number(vEnd.rows[0].cli_id) !== Number(cli_id)) {
      throw { status: 400, message: 'Endereço não pertence ao cliente informado' }
    }

    // Status
    const vStt = await db.query('SELECT stt_id FROM t_status WHERE stt_id = $1', [stt_id])
    if (vStt.rows.length === 0) {
      throw { status: 400, message: 'Status informado não existe' }
    }

    // Responsável (opcional)
    if (usu_id != null) {
      const vResp = await db.query('SELECT usu_id FROM t_usuresponsavel WHERE usu_id = $1', [usu_id])
      if (vResp.rows.length === 0) {
        throw { status: 400, message: 'Responsável informado não existe' }
      }
    }

    if (vei_id != null) {
      const vVei = await db.query('SELECT vei_id FROM t_usuresponsavel WHERE vei_id = $1', [vei_id])
      if (vVei.rows.length === 0) {
        throw { status: 400, message: 'Veículo informado não existe' }
      }
    }

    const result = await db.query(sql_post, [
      cli_id, end_id, stt_id, observacao, data, hora, usu_id, vei_id
    ])
    return { mensagem: 'Ordem criada com sucesso!', id: result.rows[0].id }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao tentar criar Ordem ' + err.message }
  }
}

const putOrdem = async (params) => {
  try {
    const {
      id,
      cli_id,
      end_id,
      stt_id,
      observacao = null,
      data = null,
      hora = null,
      usu_id = null,
      vei_id = null
    } = params

    // ===== validações de FK =====
    const vCli = await db.query('SELECT cli_id FROM t_cliente WHERE cli_id = $1', [cli_id])
    if (vCli.rows.length === 0) throw { status: 400, message: 'Cliente informado não existe' }

    const vEnd = await db.query('SELECT end_id, cli_id FROM t_endercli WHERE end_id = $1', [end_id])
    if (vEnd.rows.length === 0) throw { status: 400, message: 'Endereço informado não existe' }
    if (Number(vEnd.rows[0].cli_id) !== Number(cli_id)) {
      throw { status: 400, message: 'Endereço não pertence ao cliente informado' }
    }

    const vStt = await db.query('SELECT stt_id FROM t_status WHERE stt_id = $1', [stt_id])
    if (vStt.rows.length === 0) throw { status: 400, message: 'Status informado não existe' }

    if (usu_id != null) {
      const vResp = await db.query('SELECT usu_id FROM t_usuresponsavel WHERE usu_id = $1', [usu_id])
      if (vResp.rows.length === 0) throw { status: 400, message: 'Responsável informado não existe' }
    }

    if (vei_id != null) {
      const vVei = await db.query('SELECT vei_id FROM t_usuresponsavel WHERE vei_id = $1', [vei_id])
      if (vVei.rows.length === 0) {
        throw { status: 400, message: 'Veículo informado não existe' }
      }
    }

    const result = await db.query(sql_put, [
      id, cli_id, end_id, stt_id, observacao, data, hora, usu_id, vei_id
    ])
    if (result.rows.length === 0) {
      throw new Error('Ordem não encontrada')
    }
    return { mensagem: 'Ordem atualizada com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const patchOrdem = async (params) => {
  try {
    const { id } = params
    let fields = []
    let binds = [id]
    let count = 1

    if (params.cli_id !== undefined) {
      const vCli = await db.query('SELECT cli_id FROM t_cliente WHERE cli_id = $1', [params.cli_id])
      if (vCli.rows.length === 0) throw { status: 400, message: 'Cliente informado não existe' }
      count++
      fields.push(`cli_id = $${count}`)
      binds.push(params.cli_id)
    }

    if (params.end_id !== undefined) {
      const vEnd = await db.query('SELECT end_id, cli_id FROM t_endercli WHERE end_id = $1', [params.end_id])
      if (vEnd.rows.length === 0) throw { status: 400, message: 'Endereço informado não existe' }
      // se também veio cli_id, valida a coerência; se não, busca o cli_id atual da ordem
      let refCliId = params.cli_id
      if (refCliId === undefined) {
        const cur = await db.query('SELECT cli_id FROM t_ordem WHERE ord_id = $1', [id])
        if (!cur.rows.length) throw new Error('Ordem não encontrada')
        refCliId = cur.rows[0].cli_id
      }
      if (Number(vEnd.rows[0].cli_id) !== Number(refCliId)) {
        throw { status: 400, message: 'Endereço não pertence ao cliente informado' }
      }
      count++
      fields.push(`end_id = $${count}`)
      binds.push(params.end_id)
    }

    if (params.stt_id !== undefined) {
      const vStt = await db.query('SELECT stt_id FROM t_status WHERE stt_id = $1', [params.stt_id])
      if (vStt.rows.length === 0) throw { status: 400, message: 'Status informado não existe' }
      count++
      fields.push(`stt_id = $${count}`)
      binds.push(params.stt_id)
    }

    if (params.usu_id !== undefined) {
      if (params.usu_id === null) {
        count++
        fields.push(`ord_responsavel = $${count}`)
        binds.push(null)
      } else {
        const vResp = await db.query('SELECT usu_id FROM t_usuresponsavel WHERE usu_id = $1', [params.usu_id])
        if (vResp.rows.length === 0) throw { status: 400, message: 'Responsável informado não existe' }
        count++
        fields.push(`ord_responsavel = $${count}`)
        binds.push(params.usu_id)
      }
    }

    if (params.vei_id !== undefined) {
      if (params.vei_id === null) {
        count++
        fields.push(`vei_id = $${count}`)
        binds.push(null)
      } else {
        const vVei = await db.query('SELECT vei_id FROM t_veiculo WHERE vei_id = $1', [params.vei_id])
        if (vVei.rows.length === 0) throw { status: 400, message: 'Veículo informado não existe' }
        count++
        fields.push(`vei_id = $${count}`)
        binds.push(params.vei_id)
      }
    }

    if (params.observacao !== undefined) {
      count++; fields.push(`ord_observacao = $${count}`); binds.push(params.observacao)
    }
    if (params.data !== undefined) {
      count++; fields.push(`ord_data = $${count}`); binds.push(params.data)
    }
    if (params.hora !== undefined) {
      count++; fields.push(`ord_hora = $${count}`); binds.push(params.hora)
    }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' }
    }

    const sql = `
      UPDATE t_ordem
         SET ${fields.join(', ')}
       WHERE ord_id = $1
   RETURNING ord_id AS id
    `
    const result = await db.query(sql, binds)
    if (result.rows.length === 0) {
      throw new Error('Ordem não encontrada')
    }

    return { mensagem: 'Ordem atualizada com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const deleteOrdem = async (id) => {
  try {
    // Mata primeiro os pagamentos vinculados
    await db.query(sql_deletepag, [id])
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) {
      throw new Error('Ordem não encontrada')
    }
    return { mensagem: 'Ordem deletada com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

module.exports = {
  getOrdemById,
  getOrdens,
  postOrdem,
  putOrdem,
  patchOrdem,
  deleteOrdem
}
