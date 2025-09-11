const usuarioController = require('../controllers/usuario');

module.exports = (app) => {
    app.get('/usuario', usuarioController.getUsuarios);
    app.get('/usuario/:id', usuarioController.getById);
    app.post('/usuario', usuarioController.postUsuario);
    app.patch('/usuario/:id', usuarioController.patchUsuario);
    app.delete('/usuario/:id', usuarioController.deleteUsuario);
}