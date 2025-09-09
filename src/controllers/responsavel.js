const usuresponsavelService = require('../service/responsavel')

const getResponsaveis = async (req, res, next) => {
  try {
    const retorno = await usuresponsavelService.getResponsaveis()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const retorno = await usuresponsavelService.getResponsavelById(id)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.status === 404 || err.message === 'Usuário responsável não encontrado') {
      res.status(404).send('Usuário responsável não encontrado')
    } else {
      res.status(500).send(err.message)
    }
  }
}

const postResponsavel = async (req, res, next) => {
  try {
    const retorno = await usuresponsavelService.postResponsavel(req.body)
    res.status(201).json(retorno)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const putResponsavel = async (req, res, next) => {
  try {
    const params = { ...req.body, id: req.params.id }
    const retorno = await usuresponsavelService.putResponsavel(params)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.status === 404 || err.message === 'Usuário responsável não encontrado') {
      res.status(404).send('Usuário responsável não encontrado')
    } else {
      res.status(500).send(err.message)
    }
  }
}

const patchResponsavel = async (req, res, next) => {
  try {
    const params = { ...req.body, id: req.params.id }
    const retorno = await usuresponsavelService.patchResponsavel(params)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.status === 404 || err.message === 'Usuário responsável não encontrado') {
      res.status(404).send('Usuário responsável não encontrado')
    } else {
      res.status(500).send(err.message)
    }
  }
}

const deleteResponsavel = async (req, res, next) => {
  try {
    const retorno = await usuresponsavelService.deleteResponsavel(req.params.id)
    res.status(204).json(retorno)
  } catch (err) {
    if (err.status === 404 || err.message === 'Usuário responsável não encontrado') {
      res.status(404).send('Usuário responsável não encontrado')
    } else {
      res.status(500).send(err.message)
    }
  }
}

module.exports = {
  getResponsaveis,
  getById,
  postResponsavel,
  putResponsavel,
  patchResponsavel,
  deleteResponsavel
}
