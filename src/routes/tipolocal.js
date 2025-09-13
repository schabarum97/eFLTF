// routes/tipolocal.js
const tipolocalController = require("../controllers/tipolocal");
const checkPermission = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/tipolocal", checkPermission.check, tipolocalController.getTiposLocal
    /*
        #swagger.tags = ["Tipo de Local"]
        #swagger.summary = "Lista todos os Tipos de Local"
        #swagger.description = 'Retorna a lista completa de tipos de local cadastrados'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "items": [
                    { "id": 1, "nome": "Casa", "valor": 250.00, "ativo": "S" },
                    { "id": 2, "nome": "Prédio residencial", "valor": 650.00, "ativo": "S" }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar tipos de local' }
    */
  );

  app.get("/tipolocal/ativos", checkPermission.check, tipolocalController.getAtivos
    /*
        #swagger.tags = ["Tipo de Local"]
        #swagger.summary = "Lista Tipos de Local Ativos"
        #swagger.description = 'Retorna somente os tipos de local com tpl_ativo = S'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "items": [
                    { "id": 1, "nome": "Casa", "valor": 250.00, "ativo": "S" },
                    { "id": 3, "nome": "Prédio comercial", "valor": 850.00, "ativo": "S" }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar tipos de local ativos' }
    */
  );

  app.get("/tipolocal/id/:id", checkPermission.check, tipolocalController.getById
    /*
        #swagger.tags = ["Tipo de Local"]
        #swagger.summary = "Consulta Tipo de Local por ID"
        #swagger.description = 'Consulta os detalhes de um Tipo de Local específico pelo ID'
        
        #swagger.parameters['id'] = {
            description: 'ID do Tipo de Local',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 1,
                "item": { "id": 1, "nome": "Casa", "valor": 250.00, "ativo": "S" }
            }
        }
        #swagger.responses[404] = { description: 'Tipo de local não encontrado' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/tipolocal", checkPermission.check, tipolocalController.postTipoLocal
    /* 
        #swagger.tags = ["Tipo de Local"]
        #swagger.summary = "Cria um novo Tipo de Local"
        #swagger.description = 'Cria um novo Tipo de Local no sistema'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar um novo Tipo de Local',
            required: true,
            schema: {
                $nome: "Casa",
                valor: 250.00,
                ativo: "S"
            }
        }
        #swagger.responses[201] = {
            description: 'Criado',
            schema: { mensagem: 'Tipo de local criado com sucesso!', id: 1 }
        }  
        #swagger.responses[409] = { description: 'Conflito (nome já existente)' }
        #swagger.responses[500] = { description: 'Erro ao tentar criar o Tipo de Local' }    
    */
  );

  app.put("/tipolocal/:id", checkPermission.check, tipolocalController.putTipoLocal
    /*
        #swagger.tags = ["Tipo de Local"]
        #swagger.summary = "Atualiza Tipo de Local por ID"
        #swagger.description = 'Atualiza os detalhes de um Tipo de Local específico pelo ID'
        
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do Tipo de Local',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar o Tipo de Local',
            required: true,
            schema: {
                $nome: "Casa",
                valor: 260.00,
                ativo: "S"
            }
        }

        #swagger.responses[200] = {
            description: 'Atualizado',
            schema: { mensagem: 'Tipo de local atualizado com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Tipo de local não encontrado' }
        #swagger.responses[409] = { description: 'Conflito (nome já existente)' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o Tipo de Local' }    
    */
  );

  app.patch("/tipolocal/:id", checkPermission.check, tipolocalController.patchTipoLocal
    /* 
        #swagger.tags = ["Tipo de Local"]
        #swagger.summary = "Atualiza parcialmente Tipo de Local por ID"
        #swagger.description = 'Atualiza parcialmente os dados de um Tipo de Local específico pelo ID'
               
        #swagger.parameters['id'] = {
            description: 'ID do Tipo de Local',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Campos para atualizar parcialmente',
            required: true,
            schema: {
                valor: 300.00,
                ativo: "N"
            }
        }

        #swagger.responses[200] = {
            description: 'Atualizado',
            schema: { mensagem: 'Tipo de local atualizado com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Tipo de local não encontrado' }
        #swagger.responses[409] = { description: 'Conflito (nome já existente)' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o Tipo de Local' }    
    */
  );

  app.delete("/tipolocal/:id", checkPermission.check, tipolocalController.deleteTipoLocal
    /*
        #swagger.tags = ["Tipo de Local"]
        #swagger.summary = "Deleta Tipo de Local por ID"
        #swagger.description = 'Deleta um Tipo de Local específico pelo ID'
        
        #swagger.parameters['id'] = {
            description: 'ID do Tipo de Local',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.responses[204] = {
            description: 'Deletado',
            schema: { mensagem: 'Tipo de local deletado com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Tipo de local não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar o Tipo de Local' }    
    */
  );
};
