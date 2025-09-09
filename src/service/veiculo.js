// src/service/veiculo.js
const db = require('../configs/pg')

const baseSelect = `
  SELECT
    vei_id     AS id,
    vei_placa  AS placa,
    vei_modelo AS modelo,
    vei_marca  AS marca,
    vei_ano    AS ano,
    vei_ativo  AS ativo
  FROM t_veiculo`

const sql_getById = `
  ${baseSelect}
  WHERE t_veiculo.vei_id = $1`

const sql_getAll = `
  ${baseSelect}
  ORDER BY t_veiculo.vei_id`

const sql_post = `
  INSERT INTO t_veiculo (vei_placa, vei_modelo, vei_marca, vei_ano, vei_ativo)
  VALUES ($1, $2, $3, $4, COALESCE($5, 'S'))
  RETURNING vei_id AS id`

const sql_put = `
  UPDATE t_veiculo
     SET vei_placa  = $2,
         vei_modelo = $3,
         vei_marca  = $4,
         vei_ano    = $5,
         vei_ativo  = COALESCE($6, 'S')
   WHERE vei_id     = $1
RETURNING vei_id AS id`

const sql_delete = `
  DELETE FROM t_veiculo
   WHERE vei_id = $1
RETURNING vei_id AS id`

const getVeiculoById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id])
    if (result.rows.length === 0) {
      throw new Error('NotFound')
    }
    return { total: result.rows.length, item: result.rows[0] }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Veículo não encontrado' }
    }
    throw { status: 500, message: 'Erro ao buscar Veículo ' + err.message }
  }
}

const getVeiculos = async () => {
  try {
    const result = await db.query(sql_getAll)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Veículos ' + err.message }
  }
}

const postVeiculo = async (params) => {
  try {
    const { placa, modelo, marca, ano, ativo } = params
    const result = await db.query(sql_post, [placa, modelo, marca, ano, ativo])
    return { mensagem: 'Veículo criado com sucesso!', id: result.rows[0].id }
  } catch (err) {
    throw { status: 500, message: 'Erro ao tentar criar Veículo ' + err.message }
  }
}

const putVeiculo = async (params) => {
  try {
    const { id, placa, modelo, marca, ano, ativo } = params
    const result = await db.query(sql_put, [id, placa, modelo, marca, ano, ativo])
    if (result.rows.length === 0) {
      throw new Error('Veículo não encontrado')
    }
    return { mensagem: 'Veículo atualizado com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

const patchVeiculo = async (params) => {
  try {
    const { id } = params
    let fields = []
    let binds = [id]
    let count = 1

    if (params.placa !== undefined) {
      count++
      fields.push(`vei_placa = $${count}`)
      binds.push(params.placa)
    }
    if (params.modelo !== undefined) {
      count++
      fields.push(`vei_modelo = $${count}`)
      binds.push(params.modelo)
    }
    if (params.marca !== undefined) {
      count++
      fields.push(`vei_marca = $${count}`)
      binds.push(params.marca)
    }
    if (params.ano !== undefined) {
      count++
      fields.push(`vei_ano = $${count}`)
      binds.push(params.ano)
    }
    if (params.ativo !== undefined) {
      count++
      fields.push(`vei_ativo = $${count}`)
      binds.push(params.ativo || 'S')
    }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' }
    }

    const sql = `
      UPDATE t_veiculo
         SET ${fields.join(', ')}
       WHERE vei_id = $1
   RETURNING vei_id AS id
    `
    const result = await db.query(sql, binds)

    if (result.rows.length === 0) {
      throw new Error('Veículo não encontrado')
    }
    return { mensagem: 'Veículo atualizado com sucesso!' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
}

const deleteVeiculo = async (id) => {
  try {
    const result = await db.query(sql_delete, [id])
    if (result.rows.length === 0) {
      throw new Error('Veículo não encontrado')
    }
    return { mensagem: 'Veículo deletado com sucesso!' }
  } catch (err) {
    throw { status: 500, message: err.message }
  }
}

module.exports = {
  getVeiculoById,
  getVeiculos,
  postVeiculo,
  putVeiculo,
  patchVeiculo,
  deleteVeiculo
}
