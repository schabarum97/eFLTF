const ufController = require("../controllers/uf");

module.exports = (app) => {
  app.get("/uf", ufController.getUfs
    /*
        #swagger.tags = ["UF"]
        #swagger.summary = "Lista todas as UFs"
        #swagger.description = 'Retorna a lista completa de UFs cadastradas'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "ufs": [
                    { "uf_id": 1, "uf_nome": "São Paulo" },
                    { "uf_id": 2, "uf_nome": "Rio de Janeiro" }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar UFs' }
    */
  );

  app.get("/uf/id/:id", ufController.getById
    /*
        #swagger.tags = ["UF"]
        #swagger.summary = "Consulta UF por ID"
        #swagger.description = 'Consulta os detalhes de uma UF específica pelo ID'
        
        #swagger.parameters['id'] = {
            description: 'ID da UF',
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
                "uf": { "uf_id": 1, "uf_nome": "São Paulo" }
            }
        }
        #swagger.responses[404] = { description: 'UF não encontrada' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/uf", ufController.postUf
    /*
        #swagger.tags = ["UF"]
        #swagger.summary = "Cria uma nova UF"
        #swagger.description = 'Cria uma nova UF no sistema'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar uma nova UF',
            required: true,
            schema: { $nome: "Minas Gerais" }
        }

        #swagger.responses[201] = {
            description: 'UF criada',
            schema: { mensagem: 'UF criada com sucesso!', id: 1 }
        }  
        #swagger.responses[500] = { description: 'Erro ao tentar criar a UF' }    
    */
  );

  app.put("/uf/:id", ufController.putUf
    /*
        #swagger.tags = ["UF"]
        #swagger.summary = "Atualiza UF por ID"
        #swagger.description = 'Atualiza os detalhes de uma UF específica pelo ID'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da UF',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar a UF',
            required: true,
            schema: { $nome: "São Paulo Atualizada" }
        }

        #swagger.responses[200] = {
            description: 'UF atualizada',
            schema: { mensagem: 'UF atualizada com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'UF não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar a UF' }    
    */
  );

  app.patch("/uf/:id", ufController.patchUf
    /*
        #swagger.tags = ["UF"]
        #swagger.summary = "Atualiza parcialmente UF por ID"
        #swagger.description = 'Atualiza parcialmente os dados de uma UF específica pelo ID'
               
        #swagger.parameters['id'] = {
            description: 'ID da UF',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar parcialmente a UF',
            required: true,
            schema: { nome: "UF Parcialmente Atualizada" }
        }

        #swagger.responses[200] = { description: 'UF atualizada', schema: { mensagem: 'UF atualizada com sucesso!' } }
        #swagger.responses[404] = { description: 'UF não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar a UF' }    
    */
  );

  app.delete("/uf/:id", ufController.deleteUf
    /*
        #swagger.tags = ["UF"]
        #swagger.summary = "Deleta UF por ID"
        #swagger.description = 'Deleta uma UF específica pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID da UF',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.responses[204] = {
            description: 'UF deletada',
            schema: { mensagem: 'UF deletada com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'UF não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar a UF' }    
    */
  );
};
