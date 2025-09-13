// service/tipolocal.js
const db = require('../configs/pg')

const baseSelect = `
  SELECT
    tpl_id   AS id,
    tpl_nome AS nome,
    tpl_valor AS valor,
    tpl_ativo AS ativo
  FROM t_tipolocal
`

const sql_getById = `
  ${baseSelect}
  WHERE t_tipolocal.tpl_id = $1
`

const sql_getAll = `
  ${baseSelect}
  ORDER BY t_tipolocal.tpl_id
`

const sql_getAtivos = `
  ${baseSelect}
  WHERE t_tipolocal.tpl_ativo = 'S'
  ORDER BY t_tipolocal.tpl_id
`

const sql_post = `
  INSERT INTO t_tipolocal (tpl_nome, tpl_valor, tpl_ativo)
  VALUES ($1, $2, COALESCE($3, 'S'))
  RETURNING tpl_id AS id
`

const sql_put = `
  UPDATE t_tipolocal
     SET tpl_nome  = $2,
         tpl_valor = $3,
         tpl_ativo = $4
   WHERE tpl_id    = $1
RETURNING tpl_id AS id
`

const sql_delete = `
  DELETE FROM t_tipolocal
   WHERE tpl_id = $1
RETURNING tpl_id AS id
`

// ===== CRUD =====
const getTipoLocalById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) throw new Error('NotFound')
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Tipo de local não encontrado' }
    }
    throw { status: 500, message: 'Erro ao buscar Tipo de local ' + err.message }
  }
}

const getTiposLocal = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Tipos de local ' + err.message }
  }
}

// só ativos (útil pro bot)
const getTiposLocalAtivos = async () => {
  try {
    const result = await db.query(sql_getAtivos)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Tipos de local ativos ' + err.message }
  }
}

const postTipoLocal = async (params) => {
  try {
    const { nome, valor = null, ativo = 'S' } = params
    if (!nome) throw { status: 400, message: 'Campo obrigatório: nome' }
    const result = await db.query(sql_post, [nome, valor, ativo])
    return { mensagem: 'Tipo de local criado com sucesso!', id: result.rows[0].id }
  } catch (err) {
    // 23505 = unique_violation
    if (err.code === '23505') {
      throw { status: 409, message: 'Já existe um Tipo de local com esse nome' }
    }
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao tentar criar Tipo de local ' + err.message }
  }
}

const putTipoLocal = async (params) => {
  try {
    const { id, nome, valor = null, ativo = 'S' } = params
    if (!id)   throw { status: 400, message: 'Campo obrigatório: id' }
    if (!nome) throw { status: 400, message: 'Campo obrigatório: nome' }

    const result = await db.query(sql_put, [id, nome, valor, ativo])
    if (result.rows.length === 0) throw new Error('NotFound')
    return { mensagem: 'Tipo de local atualizado com sucesso!' }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Tipo de local não encontrado' }
    }
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const patchTipoLocal = async (params) => {
  try {
    const { id } = params
    if (!id) throw { status: 400, message: 'Campo obrigatório: id' }

    const fields = []
    const binds = [id]
    let idx = 1

    if (params.nome !== undefined) {
      idx++; fields.push(`tpl_nome = $${idx}`); binds.push(params.nome)
    }
    if (params.valor !== undefined) {
      idx++; fields.push(`tpl_valor = $${idx}`); binds.push(params.valor)
    }
    if (params.ativo !== undefined) {
      idx++; fields.push(`tpl_ativo = $${idx}`); binds.push(params.ativo)
    }

    if (!fields.length) throw { status: 400, message: 'Nenhum campo para atualizar' }

    const sql = `
      UPDATE t_tipolocal
         SET ${fields.join(', ')}
       WHERE tpl_id = $1
   RETURNING tpl_id AS id
    `
    const result = await db.query(sql, binds)
    if (result.rows.length === 0) throw new Error('NotFound')
    return { mensagem: 'Tipo de local atualizado com sucesso!' }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Tipo de local não encontrado' }
    }
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const deleteTipoLocal = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) throw new Error('NotFound')
    return { mensagem: 'Tipo de local deletado com sucesso!' }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Tipo de local não encontrado' }
    }
    throw { status: 500, message: err.message }
  }
}

module.exports = {
  getTipoLocalById,
  getTiposLocal,
  getTiposLocalAtivos,
  postTipoLocal,
  putTipoLocal,
  patchTipoLocal,
  deleteTipoLocal
}
