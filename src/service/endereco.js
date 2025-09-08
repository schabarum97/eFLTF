const db = require('../configs/pg')

const sql_getById = `
  SELECT
    e.end_id        AS id,
    e.cli_id        AS cli_id,
    e.cid_id        AS cid_id,
    e.cli_bairro    AS bairro,
    e.cli_logradouro AS logradouro,
    e.cli_cep       AS cep,
    e.cli_numero    AS numero,
    e.cli_endereco  AS endereco,
    e.cli_ativo     AS ativo,
    c.cid_nome      AS cidade_nome,
    cl.cli_nome     AS cliente_nome
  FROM t_endercli e
  JOIN t_cidade  c  ON e.cid_id = c.cid_id
  JOIN t_cliente cl ON e.cli_id = cl.cli_id
  WHERE e.end_id = $1
`

const getEnderecoById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) {
      throw new Error('NotFound')
    }
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Endereço não encontrado' }
    }
    throw { status: 500, message: 'Erro ao buscar Endereço ' + err.message }
  }
}

const sql_getAll = `
  SELECT
    e.end_id        AS id,
    e.cli_id        AS cli_id,
    e.cid_id        AS cid_id,
    e.cli_bairro    AS bairro,
    e.cli_logradouro AS logradouro,
    e.cli_cep       AS cep,
    e.cli_numero    AS numero,
    e.cli_endereco  AS endereco,
    e.cli_ativo     AS ativo,
    c.cid_nome      AS cidade_nome,
    cl.cli_nome     AS cliente_nome
  FROM t_endercli e
  JOIN t_cidade  c  ON e.cid_id = c.cid_id
  JOIN t_cliente cl ON e.cli_id = cl.cli_id
`

const getEnderecos = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Endereços ' + err.message }
  }
}

const sql_post = `
  INSERT INTO t_endercli
    (cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco, cli_ativo)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, COALESCE($8,'S'))
  RETURNING end_id AS id
`

const postEndereco = async (params) => {
  try {
    const { cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco, cli_ativo } = params

    // valida cliente e cidade
    const cliente = await db.query('SELECT cli_id FROM t_cliente WHERE cli_id = $1', [cli_id])
    if (cliente.rows.length === 0) throw { status: 400, message: 'Cliente informado não existe' }

    const cidade  = await db.query('SELECT cid_id FROM t_cidade  WHERE cid_id = $1', [cid_id])
    if (cidade.rows.length === 0)  throw { status: 400, message: 'Cidade informada não existe' }

    const result = await db.query(sql_post, [
      cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco, cli_ativo
    ])
    return { mensagem: 'Endereço criado com sucesso!', id: result.rows[0].id }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao tentar criar Endereço ' + err.message }
  }
}

const sql_put = `
  UPDATE t_endercli
     SET cli_id        = $2,
         cid_id        = $3,
         cli_bairro    = $4,
         cli_logradouro= $5,
         cli_cep       = $6,
         cli_numero    = $7,
         cli_endereco  = $8,
         cli_ativo     = COALESCE($9,'S')
   WHERE end_id        = $1
RETURNING end_id AS id
`

const putEndereco = async (params) => {
  try {
    const { id, cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco, cli_ativo } = params

    // valida cliente e cidade
    const cliente = await db.query('SELECT cli_id FROM t_cliente WHERE cli_id = $1', [cli_id])
    if (cliente.rows.length === 0) throw { status: 400, message: 'Cliente informado não existe' }

    const cidade  = await db.query('SELECT cid_id FROM t_cidade  WHERE cid_id = $1', [cid_id])
    if (cidade.rows.length === 0)  throw { status: 400, message: 'Cidade informada não existe' }

    const result = await db.query(sql_put, [
      id, cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco, cli_ativo
    ])
    if (result.rows.length === 0) throw new Error('Endereço não encontrado')

    return { mensagem: 'Endereço atualizado com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const patchEndereco = async (params) => {
  try {
    const { id } = params
    let fields = []
    let binds  = [id]
    let count  = 1

    if (params.cli_id !== undefined) {
      const cliente = await db.query('SELECT cli_id FROM t_cliente WHERE cli_id = $1', [params.cli_id])
      if (cliente.rows.length === 0) throw { status: 400, message: 'Cliente informado não existe' }
      count++; fields.push(`cli_id = $${count}`); binds.push(params.cli_id)
    }

    if (params.cid_id !== undefined) {
      const cidade = await db.query('SELECT cid_id FROM t_cidade WHERE cid_id = $1', [params.cid_id])
      if (cidade.rows.length === 0) throw { status: 400, message: 'Cidade informada não existe' }
      count++; fields.push(`cid_id = $${count}`); binds.push(params.cid_id)
    }

    if (params.cli_bairro !== undefined)    { count++; fields.push(`cli_bairro = $${count}`);    binds.push(params.cli_bairro) }
    if (params.cli_logradouro !== undefined){ count++; fields.push(`cli_logradouro = $${count}`); binds.push(params.cli_logradouro) }
    if (params.cli_cep !== undefined)       { count++; fields.push(`cli_cep = $${count}`);       binds.push(params.cli_cep) }
    if (params.cli_numero !== undefined)    { count++; fields.push(`cli_numero = $${count}`);    binds.push(params.cli_numero) }
    if (params.cli_endereco !== undefined)  { count++; fields.push(`cli_endereco = $${count}`);  binds.push(params.cli_endereco) }
    if (params.cli_ativo !== undefined)     { count++; fields.push(`cli_ativo = $${count}`);     binds.push(params.cli_ativo) }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' }
    }

    const sql = `
      UPDATE t_endercli
         SET ${fields.join(', ')}
       WHERE end_id = $1
   RETURNING end_id AS id
    `
    const result = await db.query(sql, binds)
    if (result.rows.length === 0) throw new Error('Endereço não encontrado')

    return { mensagem: 'Endereço atualizado com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const sql_delete = `
  DELETE FROM t_endercli
   WHERE end_id = $1
RETURNING end_id AS id
`

const deleteEndereco = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) throw new Error('Endereço não encontrado')
    return { mensagem: 'Endereço deletado com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

module.exports = {
  getEnderecoById,
  getEnderecos,
  postEndereco,
  putEndereco,
  patchEndereco,
  deleteEndereco
}
