const db = require('../configs/pg')

const sql_getById = `
  SELECT
    c.cid_id   AS id,
    c.cid_nome AS nome,
    c.uf_id    AS uf_id,
    u.uf_nome  AS uf_nome,
    u.uf_sigla AS uf_sigla
  FROM t_cidade c
  JOIN t_uf u ON c.uf_id = u.uf_id
  WHERE c.cid_id = $1
`

const getCidadeById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) {
      throw new Error('NotFound')
    }
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Cidade não encontrada' }
    }
    throw { status: 500, message: 'Erro ao buscar Cidade ' + err.message }
  }
}

const sql_getAll = `
  SELECT
    c.cid_id   AS id,
    c.cid_nome AS nome,
    c.uf_id    AS uf_id,
    u.uf_nome  AS uf_nome,
    u.uf_sigla AS uf_sigla
  FROM t_cidade c
  JOIN t_uf u ON c.uf_id = u.uf_id
`

const getCidades = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Cidades ' + err.message }
  }
}

const sql_post = `
  INSERT INTO t_cidade (cid_nome, uf_id)
  VALUES ($1, $2)
  RETURNING cid_id AS id
`

const postCidade = async (params) => {
  try {
    const { nome, uf_id } = params

    // valida UF
    const uf = await db.query('SELECT uf_id FROM t_uf WHERE uf_id = $1', [uf_id])
    if (uf.rows.length === 0) {
      throw { status: 400, message: 'UF informada não existe' }
    }

    const result = await db.query(sql_post, [nome, uf_id])
    return { mensagem: 'Cidade criada com sucesso!', id: result.rows[0].id }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao tentar criar Cidade ' + err.message }
  }
}

const sql_put = `
  UPDATE t_cidade
     SET cid_nome = $2,
         uf_id    = $3
   WHERE cid_id   = $1
RETURNING cid_id AS id
`

const putCidade = async (params) => {
  try {
    const { id, nome, uf_id } = params

    // valida UF
    const uf = await db.query('SELECT uf_id FROM t_uf WHERE uf_id = $1', [uf_id])
    if (uf.rows.length === 0) {
      throw { status: 400, message: 'UF informada não existe' }
    }

    const result = await db.query(sql_put, [id, nome, uf_id])
    if (result.rows.length === 0) {
      throw new Error('Cidade não encontrada')
    }
    return { mensagem: 'Cidade atualizada com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const patchCidade = async (params) => {
  try {
    const { id } = params
    let fields = []
    let binds = [id]
    let count = 1

    if (params.nome !== undefined) {
      count++
      fields.push(`cid_nome = $${count}`)
      binds.push(params.nome)
    }

    if (params.uf_id !== undefined) {
      // valida UF quando enviada
      const uf = await db.query('SELECT uf_id FROM t_uf WHERE uf_id = $1', [params.uf_id])
      if (uf.rows.length === 0) {
        throw { status: 400, message: 'UF informada não existe' }
      }
      count++
      fields.push(`uf_id = $${count}`)
      binds.push(params.uf_id)
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
    if (result.rows.length === 0) {
      throw new Error('Cidade não encontrada')
    }

    return { mensagem: 'Cidade atualizada com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const sql_delete = `
  DELETE FROM t_cidade
   WHERE cid_id = $1
RETURNING cid_id AS id
`

const deleteCidade = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) {
      throw new Error('Cidade não encontrada')
    }
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
