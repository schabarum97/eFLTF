const dashService = require('../service/dash')

const getResumo = async (req, res, next) => {
  try {
    const retorno = await dashService.getDashResumo()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}

const getPorResponsavel = async (req, res, next) => {
  try {
    const retorno = await dashService.getDashPorResponsavel()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}

const getBacklogAging = async (req, res, next) => {
  try {
    const retorno = await dashService.getDashBacklogAging()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}

const getHojeEAmanha = async (req, res, next) => {
  try {
    const retorno = await dashService.getDashHojeEAmanha()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}

const getCargaDiaHora = async (req, res, next) => {
  try {
    const retorno = await dashService.getDashCargaDiaHora()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}

const getPagamentosRecentes = async (req, res, next) => {
  try {
    const retorno = await dashService.getDashPagamentosRecentes()
    res.status(200).json(retorno)
  } catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}

module.exports = {
  getResumo,
  getPorResponsavel,
  getBacklogAging,
  getHojeEAmanha,
  getCargaDiaHora,
  getPagamentosRecentes
}
