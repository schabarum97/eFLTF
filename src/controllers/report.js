const relatorioService = require('../service/report.js') 
const getRelatorioOS = async (req, res) => {
  try {
    const { id } = req.params
    const ordId = Number(id)

    if (!ordId || Number.isNaN(ordId)) {
      return res.status(400).json({ message: 'Parâmetro "id" inválido' })
    }

    const retorno = await relatorioService.getRelatorioOS(ordId)
    return res.status(200).json(retorno)
  } catch (err) {
    const status = err.status || 500
    const body = { message: err.message || 'Erro interno' }
    if (err.detalhes) body.detalhes = err.detalhes
    return res.status(status).json(body)
  }
}

module.exports = {
  getRelatorioOS
}
