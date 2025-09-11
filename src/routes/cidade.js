const cidadeController = require("../controllers/cidade");
const checkPermission = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/cidade", checkPermission.check, cidadeController.getCidades
    /*
        #swagger.tags = ["Cidade"]
        #swagger.summary = "Lista todas as cidades"
        #swagger.description = 'Retorna a lista completa de cidades cadastradas, incluindo UF'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "cidades": [
                    { "cid_id": 1, "cid_nome": "São Paulo", "uf_id": 1, "uf_nome": "São Paulo", "uf_sigla": "SP" },
                    { "cid_id": 2, "cid_nome": "Rio de Janeiro", "uf_id": 2, "uf_nome": "Rio de Janeiro", "uf_sigla": "RJ" }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar cidades' }
    */
  );

  app.get("/cidade/id/:id", checkPermission.check, cidadeController.getById
    /*
        #swagger.tags = ["Cidade"]
        #swagger.summary = "Consulta cidade por ID"
        #swagger.description = 'Consulta os detalhes de uma cidade específica pelo ID, incluindo UF'

        #swagger.parameters['id'] = {
            description: 'ID da cidade',
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
                "cidade": { "cid_id": 1, "cid_nome": "São Paulo", "uf_id": 1, "uf_nome": "São Paulo", "uf_sigla": "SP" }
            }
        }
        #swagger.responses[404] = { description: 'Cidade não encontrada' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/cidade", checkPermission.check, cidadeController.postCidade
    /*
        #swagger.tags = ["Cidade"]
        #swagger.summary = "Cria uma nova cidade"
        #swagger.description = 'Cria uma nova cidade no sistema, informando UF existente'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar uma nova cidade',
            required: true,
            schema: { $nome: "Campinas", $uf_id: 1 }
        }

        #swagger.responses[201] = {
            description: 'Cidade criada',
            schema: { mensagem: 'Cidade criada com sucesso!', id: 3 }
        }  
        #swagger.responses[400] = { description: 'UF informada não existe' }
        #swagger.responses[500] = { description: 'Erro ao tentar criar a cidade' }    
    */
  );

  app.put("/cidade/:id", checkPermission.check, cidadeController.putCidade
    /*
        #swagger.tags = ["Cidade"]
        #swagger.summary = "Atualiza cidade por ID"
        #swagger.description = 'Atualiza os detalhes de uma cidade específica pelo ID, incluindo alteração de UF'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da cidade',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar a cidade',
            required: true,
            schema: { $nome: "São Paulo Atualizada", $uf_id: 1 }
        }

        #swagger.responses[200] = {
            description: 'Cidade atualizada',
            schema: { mensagem: 'Cidade atualizada com sucesso!' }
        }  
        #swagger.responses[400] = { description: 'UF informada não existe' }
        #swagger.responses[404] = { description: 'Cidade não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar a cidade' }    
    */
  );

  app.patch("/cidade/:id", checkPermission.check, cidadeController.patchCidade
    /*
        #swagger.tags = ["Cidade"]
        #swagger.summary = "Atualiza parcialmente cidade por ID"
        #swagger.description = 'Atualiza parcialmente os dados de uma cidade específica pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID da cidade',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar parcialmente a cidade',
            required: true,
            schema: { nome: "Cidade Parcial", uf_id: 2 }
        }

        #swagger.responses[200] = { description: 'Cidade atualizada', schema: { mensagem: 'Cidade atualizada com sucesso!' } }
        #swagger.responses[400] = { description: 'UF informada não existe' }
        #swagger.responses[404] = { description: 'Cidade não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar a cidade' }    
    */
  );

  app.delete("/cidade/:id", checkPermission.check, cidadeController.deleteCidade
    /*
        #swagger.tags = ["Cidade"]
        #swagger.summary = "Deleta cidade por ID"
        #swagger.description = 'Deleta uma cidade específica pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID da cidade',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.responses[204] = {
            description: 'Cidade deletada',
            schema: { mensagem: 'Cidade deletada com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Cidade não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar a cidade' }    
    */
  );
};
