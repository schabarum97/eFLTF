const Cliente = require('./cliente');
const Uf = require('./uf');
const Cidade = require('./cidade');
const Endereco = require('./endereco');
const Status = require('./status');
const Ordem = require('./ordem');
const FormaPag = require('./formapag');
const OrdemPag = require('./ordempag');
const Dash = require('./dash');
const Responsavel = require('./responsavel');
const Veiculo = require('./veiculo');
const Agendamento = require('./agendamento');

module.exports = (app) => {
    Cliente(app),
    Uf(app),
    Cidade(app),
    Endereco(app),
    Status(app),
    Ordem(app),
    FormaPag(app),
    OrdemPag(app), 
    Dash(app),
    Responsavel(app),
    Veiculo(app),
    Agendamento(app)
}