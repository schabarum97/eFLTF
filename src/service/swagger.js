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
    './src/routes/cliente.js',
    './src/routes/uf.js',
    './src/routes/cidade.js',
    './src/routes/endereco.js',
    './src/routes/status.js',

];

swaggerAutogen(outputFile, endpointsFiles, doc);