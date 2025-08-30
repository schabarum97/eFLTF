const statusController = require("../controllers/status");

module.exports = (app) => {
  app.get("/status", statusController.getStatus
    /*
        #swagger.tags = ["Status"]
        #swagger.summary = "Lista todos os status"
        #swagger.description = 'Retorna a lista completa de status cadastrados'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "status": [
                    { "stt_id": 1, "stt_nome": "Ativo", "stt_cor": "verde" },
                    { "stt_id": 2, "stt_nome": "Inativo", "stt_cor": "vermelho" }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar status' }
    */
  );

  app.get("/status/id/:id", statusController.getById
    /*
        #swagger.tags = ["Status"]
        #swagger.summary = "Consulta status por ID"
        #swagger.description = 'Consulta os detalhes de um status específico pelo ID'
        
        #swagger.parameters['id'] = {
            description: 'ID do status',
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
                "status": { "stt_id": 1, "stt_nome": "Ativo", "stt_cor": "verde" }
            }
        }
        #swagger.responses[404] = { description: 'Status não encontrado' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/status", statusController.postStatus
    /*
        #swagger.tags = ["Status"]
        #swagger.summary = "Cria um novo status"
        #swagger.description = 'Cria um novo status no sistema'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar um novo status',
            required: true,
            schema: { $nome: "Ativo", $cor: "verde" }
        }

        #swagger.responses[201] = {
            description: 'Status criado',
            schema: { mensagem: 'Status criado com sucesso!', id: 3 }
        }  
        #swagger.responses[500] = { description: 'Erro ao tentar criar o status' }    
    */
  );

  app.put("/status/:id", statusController.putStatus
    /*
        #swagger.tags = ["Status"]
        #swagger.summary = "Atualiza status por ID"
        #swagger.description = 'Atualiza os detalhes de um status específico pelo ID'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do status',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar o status',
            required: true,
            schema: { $nome: "Inativo", $cor: "vermelho" }
        }

        #swagger.responses[200] = {
            description: 'Status atualizado',
            schema: { mensagem: 'Status atualizado com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Status não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o status' }    
    */
  );

  app.patch("/status/:id", statusController.patchStatus
    /*
        #swagger.tags = ["Status"]
        #swagger.summary = "Atualiza parcialmente status por ID"
        #swagger.description = 'Atualiza parcialmente os dados de um status específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do status',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar parcialmente o status',
            required: true,
            schema: { nome: "Ativo", cor: "verde" }
        }

        #swagger.responses[200] = { description: 'Status atualizado', schema: { mensagem: 'Status atualizado com sucesso!' } }
        #swagger.responses[404] = { description: 'Status não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o status' }    
    */
  );

  app.delete("/status/:id", statusController.deleteStatus
    /*
        #swagger.tags = ["Status"]
        #swagger.summary = "Deleta status por ID"
        #swagger.description = 'Deleta um status específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do status',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.responses[204] = {
            description: 'Status deletado',
            schema: { mensagem: 'Status deletado com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Status não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar o status' }    
    */
  );
};
