// controllers/ordpag.js
const ordPagService = require('../service/ordempag')

const getOrdPags = async (req, res, next) => {
  try {
    const retorno = await ordPagService.getOrdPags()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const retorno = await ordPagService.getOrdPagById(id)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.message === 'Pagamento da OS não encontrado') {
      res.status(404).send(err.message)
    } else {
      res.status(500).send(err.message)
    }
  }
}

const postOrdPag = async (req, res, next) => {
  try {
    const retorno = await ordPagService.postOrdPag(req.body)
    res.status(201).json(retorno)
  } catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}

const putOrdPag = async (req, res, next) => {
  try {
    let params = req.body
    params.id = req.params.id
    const retorno = await ordPagService.putOrdPag(params)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.message === 'Pagamento da OS não encontrado') {
      res.status(404).send(err.message)
    } else {
      res.status(err.status || 500).send(err.message)
    }
  }
}

const patchOrdPag = async (req, res, next) => {
  try {
    let params = req.body
    params.id = req.params.id
    const retorno = await ordPagService.patchOrdPag(params)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.message === 'Pagamento da OS não encontrado') {
      res.status(404).send(err.message)
    } else {
      res.status(err.status || 500).send(err.message)
    }
  }
}

const deleteOrdPag = async (req, res, next) => {
  try {
    const retorno = await ordPagService.deleteOrdPag(req.params.id)
    // segue teu padrão (204 com body)
    res.status(204).json(retorno)
  } catch (err) {
    if (err.message === 'Pagamento da OS não encontrado') {
      res.status(404).send(err.message)
    } else {
      res.status(500).send(err.message)
    }
  }
}

module.exports = {
  getOrdPags,
  getById,
  postOrdPag,
  putOrdPag,
  patchOrdPag,
  deleteOrdPag
}
