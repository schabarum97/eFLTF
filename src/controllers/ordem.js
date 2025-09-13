const ordemService = require('../service/ordem')

const getOrdens = async (req, res, next) => {
  try {
    const retorno = await ordemService.getOrdens()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const retorno = await ordemService.getOrdemById(id)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.message === 'Ordem não encontrada') {
      res.status(404).send(err.message)
    } else {
      res.status(err.status || 500).send(err.message)
    }
  }
}

const postOrdem = async (req, res, next) => {
  try {
    const retorno = await ordemService.postOrdem(req.body)
    res.status(201).json(retorno)
  } catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}

const putOrdem = async (req, res, next) => {
  try {
    let params = req.body
    params.id = req.params.id
    const retorno = await ordemService.putOrdem(params)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.message === 'Ordem não encontrada') {
      res.status(404).send(err.message)
    } else {
      res.status(err.status || 500).send(err.message)
    }
  }
}

const patchOrdem = async (req, res, next) => {
  try {
    let params = req.body
    params.id = req.params.id
    const retorno = await ordemService.patchOrdem(params)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.message === 'Ordem não encontrada') {
      res.status(404).send(err.message)
    } else {
      res.status(err.status || 500).send(err.message)
    }
  }
}

const deleteOrdem = async (req, res, next) => {
  try {
    const retorno = await ordemService.deleteOrdem(req.params.id)
    res.status(204).json(retorno)
  } catch (err) {
    if (err.message === 'Ordem não encontrada') {
      res.status(404).send(err.message)
    } else {
      res.status(err.status || 500).send(err.message)
    }
  }
}

const STT_ATIVOS = [1, 2, 5]
const STT_REALIZADOS = [3]

async function getPorTelefone(req, res) {
  try {
    const { telefone, categoria } = req.query
    let stt_ids = null
    if (categoria === 'ativos') stt_ids = STT_ATIVOS
    else if (categoria === 'realizados') stt_ids = STT_REALIZADOS

    const data = await ordemService.getOrdensPorTelefone({ telefone, stt_ids })
    res.json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
  }
}

module.exports = {
  getOrdens,
  getById,
  postOrdem,
  putOrdem,
  patchOrdem,
  deleteOrdem,
  getPorTelefone
}
