const Cliente = require('./cliente');
const Uf = require('./uf');
const Cidade = require('./cidade');
const Endereco = require('./endereco');
const Status = require('./status');
const Ordem = require('./ordem');

module.exports = (app) => {
    Cliente(app),
    Uf(app),
    Cidade(app),
    Endereco(app),
    Status(app),
    Ordem(app)
}