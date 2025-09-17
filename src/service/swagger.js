const swaggerAutogen = require('swagger-autogen')('pt-BR');

const doc = {
    info: {
        version: "1.0.0",
        title: "Projeto Back TCC",
        description: "Documentação da Projeto Back TCC"
    },
    host: `localhost:3000`,
    basePath:"",
    schemes: [''],
    consumes: ['aplication/json'], 
    produces: ['aplication/json'],
}

const outputFile = './src/docs/swagger.yaml';
const endpointsFiles = [
    './src/routes/agendamento.js',
    './src/routes/cidade.js',
    './src/routes/cliente.js',
    './src/routes/dash.js',
    './src/routes/endereco.js',
    './src/routes/formapag.js',
    './src/routes/ordem.js',
    './src/routes/ordempag.js',
    './src/routes/responsavel.js',
    './src/routes/status.js',
    './src/routes/tipolocal.js',
    './src/routes/uf.js',
    './src/routes/usuario.js',
    './src/routes/veiculo.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc);