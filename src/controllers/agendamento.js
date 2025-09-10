const agendamentoService = require('../service/agendamento')

const getDisponibilidadeVeiculos = async (req, res) => {
  try {
    const { de, ate } = req.query
    const params = {de, ate}

    const retorno = await agendamentoService.getDisponibilidadeVeiculos(params)
    return res.status(200).json(retorno)
  } catch (err) {
    const status = err.status || 500
    const body = { message: err.message || 'Erro interno' }
    if (err.detalhes) body.detalhes = err.detalhes
    return res.status(status).json(body)
  }
}

module.exports = {
  getDisponibilidadeVeiculos
}