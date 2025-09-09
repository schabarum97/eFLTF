const veiculoService = require('../service/veiculo')

const getVeiculos = async (req, res, next) => {
  try {
    const retorno = await veiculoService.getVeiculos()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const retorno = await veiculoService.getVeiculoById(id)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.status === 404 || err.message === 'Veículo não encontrado') {
      res.status(404).send('Veículo não encontrado')
    } else {
      res.status(500).send(err.message)
    }
  }
}

const postVeiculo = async (req, res, next) => {
  try {
    const retorno = await veiculoService.postVeiculo(req.body)
    res.status(201).json(retorno)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const putVeiculo = async (req, res, next) => {
  try {
    const params = { ...req.body, id: req.params.id }
    const retorno = await veiculoService.putVeiculo(params)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.status === 404 || err.message === 'Veículo não encontrado') {
      res.status(404).send('Veículo não encontrado')
    } else {
      res.status(500).send(err.message)
    }
  }
}

const patchVeiculo = async (req, res, next) => {
  try {
    const params = { ...req.body, id: req.params.id }
    const retorno = await veiculoService.patchVeiculo(params)
    res.status(200).json(retorno)
  } catch (err) {
    if (err.status === 404 || err.message === 'Veículo não encontrado') {
      res.status(404).send('Veículo não encontrado')
    } else {
      res.status(500).send(err.message)
    }
  }
}

const deleteVeiculo = async (req, res, next) => {
  try {
    const retorno = await veiculoService.deleteVeiculo(req.params.id)
    res.status(204).json(retorno)
  } catch (err) {
    if (err.status === 404 || err.message === 'Veículo não encontrado') {
      res.status(404).send('Veículo não encontrado')
    } else {
      res.status(500).send(err.message)
    }
  }
}

module.exports = {
  getVeiculos,
  getById,
  postVeiculo,
  putVeiculo,
  patchVeiculo,
  deleteVeiculo
}
