const loginController = require("../controllers/login");
const { authRequired }  = require('../middleware/auth')

module.exports = (app) => {
    app.post('/login',  loginController.login)
    app.post('/logout', loginController.logout)
    app.get('/auth/ping', authRequired, (req, res) => res.sendStatus(204))
    app.get('/auth/me', authRequired, loginController.me)
}
