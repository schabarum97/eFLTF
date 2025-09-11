const responsavelController = require("../controllers/responsavel");
const checkPermission = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/responsavel", checkPermission.check, responsavelController.getResponsaveis
    /*
        #swagger.tags = ["Usuário Responsável"]
        #swagger.summary = "Lista todos os usuários responsáveis"
        #swagger.description = 'Retorna a lista completa de usuários responsáveis cadastrados'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "items": [
                    { "id": 1, "nome": "Rafael Costa" },
                    { "id": 2, "nome": "Mariana Rocha" }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar usuários responsáveis' }
    */
  );

  app.get("/responsavel/id/:id", checkPermission.check, responsavelController.getById
    /*
        #swagger.tags = ["Usuário Responsável"]
        #swagger.summary = "Consulta usuário responsável por ID"
        #swagger.description = 'Consulta os detalhes de um usuário responsável específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do usuário responsável',
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
                "item": { "id": 1, "nome": "Rafael Costa" }
            }
        }
        #swagger.responses[404] = { description: 'Usuário responsável não encontrado' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/responsavel", checkPermission.check, responsavelController.postResponsavel
    /*
        #swagger.tags = ["Usuário Responsável"]
        #swagger.summary = "Cria um novo usuário responsável"
        #swagger.description = 'Cria um novo usuário responsável no sistema'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar um novo usuário responsável',
            required: true,
            schema: { $nome: "Leticia Barbosa" }
        }

        #swagger.responses[201] = {
            description: 'Usuário responsável criado',
            schema: { mensagem: 'Usuário responsável criado com sucesso!', id: 3 }
        }
        #swagger.responses[500] = { description: 'Erro ao tentar criar o usuário responsável' }
    */
  );

  app.put("/responsavel/:id", checkPermission.check, responsavelController.putResponsavel
    /*
        #swagger.tags = ["Usuário Responsável"]
        #swagger.summary = "Atualiza usuário responsável por ID"
        #swagger.description = 'Atualiza os dados de um usuário responsável específico pelo ID'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do usuário responsável',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar o usuário responsável',
            required: true,
            schema: { $nome: "Rafael Costa (Atualizado)" }
        }

        #swagger.responses[200] = {
            description: 'Usuário responsável atualizado',
            schema: { mensagem: 'Usuário responsável atualizado com sucesso!' }
        }
        #swagger.responses[404] = { description: 'Usuário responsável não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o usuário responsável' }
    */
  );

  app.patch("/responsavel/:id", checkPermission.check, responsavelController.patchResponsavel
    /*
        #swagger.tags = ["Usuário Responsável"]
        #swagger.summary = "Atualiza parcialmente usuário responsável por ID"
        #swagger.description = 'Atualiza parcialmente os dados de um usuário responsável específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do usuário responsável',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar parcialmente o usuário responsável',
            required: true,
            schema: { nome: "Leticia B." }
        }

        #swagger.responses[200] = { description: 'Usuário responsável atualizado', schema: { mensagem: 'Usuário responsável atualizado com sucesso!' } }
        #swagger.responses[404] = { description: 'Usuário responsável não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o usuário responsável' }
    */
  );

  app.delete("/responsavel/:id", checkPermission.check, responsavelController.deleteResponsavel
    /*
        #swagger.tags = ["Usuário Responsável"]
        #swagger.summary = "Deleta usuário responsável por ID"
        #swagger.description = 'Deleta um usuário responsável específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do usuário responsável',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.responses[204] = {
            description: 'Usuário responsável deletado',
            schema: { mensagem: 'Usuário responsável deletado com sucesso!' }
        }
        #swagger.responses[404] = { description: 'Usuário responsável não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar o usuário responsável' }
    */
  );
};
