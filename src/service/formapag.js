const db = require('../configs/pg')

const baseSelect = `
  SELECT
    fpg_id         AS id,
    fpg_nome       AS nome,
    fpg_ativo      AS ativo,
    fpg_parcelado  AS parcelado
  FROM t_formapag
`

const sql_getById = `
  ${baseSelect}
  WHERE fpg_id = $1
`

const sql_getAll = `
  ${baseSelect}
  ORDER BY fpg_id DESC
`

const sql_post = `
  INSERT INTO t_formapag
    (fpg_nome, fpg_ativo, fpg_parcelado)
  VALUES
    ($1, COALESCE($2,'S'), COALESCE($3,'N'))
  RETURNING fpg_id AS id
`

const sql_put = `
  UPDATE t_formapag
     SET fpg_nome      = $2,
         fpg_ativo     = COALESCE($3,'S'),
         fpg_parcelado = COALESCE($4,'N')
   WHERE fpg_id = $1
RETURNING fpg_id AS id
`

const sql_delete = `
  DELETE FROM t_formapag
   WHERE fpg_id = $1
RETURNING fpg_id AS id
`

const getFormaPagById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) {
      throw new Error('NotFound')
    }
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Forma de Pagamento não encontrada' }
    }
    throw { status: 500, message: 'Erro ao buscar Forma de Pagamento ' + err.message }
  }
}

const getFormasPag = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Formas de Pagamento ' + err.message }
  }
}

const postFormaPag = async (params) => {
  try {
    const { nome, ativo, parcelado } = params
    const result = await db.query(sql_post, [nome, ativo, parcelado])
    return { mensagem: 'Forma de Pagamento criada com sucesso!', id: result.rows[0].id }
  } catch (err) {
    throw { status: 500, message: 'Erro ao tentar criar Forma de Pagamento ' + err.message }
  }
}

const putFormaPag = async (params) => {
  try {
    const { id, nome, ativo, parcelado } = params
    const result = await db.query(sql_put, [id, nome, ativo, parcelado])
    if (result.rows.length === 0) throw new Error('Forma de Pagamento não encontrada')

    return { mensagem: 'Forma de Pagamento atualizada com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const patchFormaPag = async (params) => {
  try {
    const { id } = params
    let fields = []
    let binds  = [id]
    let count  = 1

    if (params.nome !== undefined)      { count++; fields.push(`fpg_nome = $${count}`);      binds.push(params.nome) }
    if (params.ativo !== undefined)     { count++; fields.push(`fpg_ativo = $${count}`);     binds.push(params.ativo) }
    if (params.parcelado !== undefined) { count++; fields.push(`fpg_parcelado = $${count}`); binds.push(params.parcelado) }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' }
    }

    const sql = `
      UPDATE t_formapag
         SET ${fields.join(', ')}
       WHERE fpg_id = $1
   RETURNING fpg_id AS id
    `
    const result = await db.query(sql, binds)
    if (result.rows.length === 0) throw new Error('Forma de Pagamento não encontrada')

    return { mensagem: 'Forma de Pagamento atualizada com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const deleteFormaPag = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) throw new Error('Forma de Pagamento não encontrada')
    return { mensagem: 'Forma de Pagamento deletada com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

module.exports = {
  getFormaPagById,
  getFormasPag,
  postFormaPag,
  putFormaPag,
  patchFormaPag,
  deleteFormaPag
}
