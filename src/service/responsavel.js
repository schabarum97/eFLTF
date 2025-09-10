const db = require('../configs/pg')

const baseSelect = `
  SELECT
    usu_id   AS id,
    usu_nome AS nome, 
    usu_ativo AS ativo
  FROM t_usuresponsavel`;

const sql_getById = `
  ${baseSelect}
  WHERE t_usuresponsavel.usu_id = $1`;

const sql_getAll = `
  ${baseSelect}
  ORDER BY t_usuresponsavel.usu_id`;

const sql_post = `
  INSERT INTO t_usuresponsavel (usu_nome, usu_ativo)
  VALUES ($1, COALESCE($2, 'S'))
  RETURNING usu_id AS id`;

const sql_put = `
  UPDATE t_usuresponsavel
     SET usu_nome = $2, 
         usu_ativo = COALESCE($3, usu_ativo)
   WHERE usu_id   = $1
RETURNING usu_id AS id`;

const sql_delete = `
  DELETE FROM t_usuresponsavel
   WHERE usu_id = $1
RETURNING usu_id AS id`;

const getResponsavelById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) {
      throw new Error('NotFound')
    }
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Usuário responsável não encontrado' }
    }
    throw { status: 500, message: 'Erro ao buscar Usuário responsável ' + err.message }
  }
}

const getResponsaveis = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Usuários responsáveis ' + err.message }
  }
}

const postResponsavel = async (params) => {
  try {
    const { nome } = params
    const result = await db.query(sql_post, [nome, ativo])
    return { mensagem: 'Usuário responsável criado com sucesso!', id: result.rows[0].id }
  } catch (err) {
    throw { status: 500, message: 'Erro ao tentar criar Usuário responsável ' + err.message }
  }
}

const putResponsavel = async (params) => {
  try {
    const { id, nome } = params
    const result = await db.query(sql_put, [id, nome, ativo])
    if (result.rows.length === 0) {
      throw new Error('Usuário responsável não encontrado')
    }
    return { mensagem: 'Usuário responsável atualizado com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

const patchResponsavel = async (params) => {
  try {
    const { id } = params
    let fields = []
    let binds = [id]
    let count = 1

    if (params.nome !== undefined) {
      count++
      fields.push(`usu_nome = $${count}`)
      binds.push(params.nome)
    }

    if (params.ativo !== undefined) {
      count++
      fields.push(`usu_ativo = $${count}`)
      binds.push(params.ativo)
    }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' }
    }

    const sql = `
      UPDATE t_usuresponsavel
         SET ${fields.join(', ')}
       WHERE usu_id = $1
   RETURNING usu_id AS id
    `
    const result = await db.query(sql, binds)

    if (result.rows.length === 0) {
      throw new Error('Usuário responsável não encontrado')
    }
    return { mensagem: 'Usuário responsável atualizado com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const deleteResponsavel = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) {
      throw new Error('Usuário responsável não encontrado')
    }
    return { mensagem: 'Usuário responsável deletado com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

module.exports = {
  getResponsavelById,
  getResponsaveis,
  postResponsavel,
  putResponsavel,
  patchResponsavel,
  deleteResponsavel
}
