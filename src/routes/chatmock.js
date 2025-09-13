const { tratarMensagem } = require('../service/chat.js')

module.exports = (app) => {
    app.post('/chat/test', async (req, res) => {
    const { de = '5511999999999@c.us', nome = 'Teste', texto = '' } = req.body || {}
    const respostas = []
    const enviar = async (r) => respostas.push(r)

    await tratarMensagem({ de, nome, texto, enviar })
    res.json({ de, nome, texto, respostas })
})}