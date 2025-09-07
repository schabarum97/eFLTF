const db = require('../configs/pg')

const sql_getById = `
  SELECT
    cli_id   AS id,
    cli_cnpj AS cnpj,
    cli_nome AS nome,
    cli_ddi  AS ddi,
    cli_ddd  AS ddd,
    cli_fone AS fone
  FROM t_cliente
  WHERE cli_id = $1
`

const getClienteById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) {
      throw new Error('NotFound')
    }
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Cliente não encontrado' }
    }
    throw { status: 500, message: 'Erro ao buscar Cliente ' + err.message }
  }
}

const sql_getAll = `
  SELECT
    cli_id   AS id,
    cli_cnpj AS cnpj,
    cli_nome AS nome,
    cli_ddi  AS ddi,
    cli_ddd  AS ddd,
    cli_fone AS fone
  FROM t_cliente
`

const getClientes = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Clientes ' + err.message }
  }
}

const sql_post = `
  INSERT INTO t_cliente (cli_cnpj, cli_nome, cli_ddi, cli_ddd, cli_fone)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING cli_id AS id
`

const postCliente = async (params) => {
  try {
    const { cnpj, nome, ddi, ddd, fone } = params
    const result = await db.query(sql_post, [cnpj, nome, ddi, ddd, fone])
    return { mensagem: 'Cliente criado com sucesso!', id: result.rows[0].id }
  } catch (err) {
    throw { status: 500, message: 'Erro ao tentar criar Cliente ' + err.message }
  }
}

const sql_put = `
  UPDATE t_cliente
     SET cli_cnpj = $2,
         cli_nome = $3,
         cli_ddi  = $4,
         cli_ddd  = $5,
         cli_fone = $6
   WHERE cli_id   = $1
RETURNING cli_id AS id
`

const putCliente = async (params) => {
  try {
    const { id, cnpj, nome, ddi, ddd, fone } = params
    const result = await db.query(sql_put, [id, cnpj, nome, ddi, ddd, fone])
    if (result.rows.length === 0) {
      throw new Error('Cliente não encontrado')
    }
    return { mensagem: 'Cliente atualizado com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

const patchCliente = async (params) => {
  try {
    const { id } = params
    let fields = []
    let binds = [id]
    let count = 1

    if (params.cnpj !== undefined) {
      count++
      fields.push(`cli_cnpj = $${count}`)
      binds.push(params.cnpj)
    }
    if (params.nome !== undefined) {
      count++
      fields.push(`cli_nome = $${count}`)
      binds.push(params.nome)
    }
    if (params.ddi !== undefined) {
      count++
      fields.push(`cli_ddi = $${count}`)
      binds.push(params.ddi)
    }
    if (params.ddd !== undefined) {
      count++
      fields.push(`cli_ddd = $${count}`)
      binds.push(params.ddd)
    }
    if (params.fone !== undefined) {
      count++
      fields.push(`cli_fone = $${count}`)
      binds.push(params.fone)
    }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' }
    }

    const sql = `
      UPDATE t_cliente
         SET ${fields.join(', ')}
       WHERE cli_id = $1
   RETURNING cli_id AS id
    `
    const result = await db.query(sql, binds)

    if (result.rows.length === 0) {
      throw new Error('Cliente não encontrado')
    }
    return { mensagem: 'Cliente atualizado com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const sql_delete = `
  DELETE FROM t_cliente
   WHERE cli_id = $1
RETURNING cli_id AS id
`

const deleteCliente = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) {
      throw new Error('Cliente não encontrado')
    }
    return { mensagem: 'Cliente deletado com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

module.exports = {
  getClienteById,
  getClientes,
  postCliente,
  putCliente,
  patchCliente,
  deleteCliente
}
