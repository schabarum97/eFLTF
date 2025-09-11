const veiculoController = require("../controllers/veiculo");
const checkPermission = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/veiculo", checkPermission.check, veiculoController.getVeiculos
    /*
        #swagger.tags = ["Veículo"]
        #swagger.summary = "Lista todos os veículos"
        #swagger.description = 'Retorna a lista completa de veículos cadastrados'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "items": [
                    { "id": 1, "placa": "MBZ5H21", "modelo": "L-1620", "marca": "Mercedes-Benz", "ano": 2012, "ativo": "S" },
                    { "id": 2, "placa": "VLV9K33", "modelo": "FH 540 6x4", "marca": "Volvo", "ano": 2022, "ativo": "S" }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar veículos' }
    */
  );

  app.get("/veiculo/id/:id", checkPermission.check, veiculoController.getById
    /*
        #swagger.tags = ["Veículo"]
        #swagger.summary = "Consulta veículo por ID"
        #swagger.description = 'Consulta os detalhes de um veículo específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do veículo',
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
                "item": { "id": 1, "placa": "MBZ5H21", "modelo": "L-1620", "marca": "Mercedes-Benz", "ano": 2012, "ativo": "S" }
            }
        }
        #swagger.responses[404] = { description: 'Veículo não encontrado' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/veiculo", checkPermission.check, veiculoController.postVeiculo
    /*
        #swagger.tags = ["Veículo"]
        #swagger.summary = "Cria um novo veículo"
        #swagger.description = 'Cria um novo veículo no sistema'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar um novo veículo',
            required: true,
            schema: { $placa: "MBZ5H21", $modelo: "L-1620", $marca: "Mercedes-Benz", $ano: 2012, ativo: "S" }
        }

        #swagger.responses[201] = {
            description: 'Veículo criado',
            schema: { mensagem: 'Veículo criado com sucesso!', id: 3 }
        }
        #swagger.responses[500] = { description: 'Erro ao tentar criar o veículo' }
    */
  );

  app.put("/veiculo/:id", checkPermission.check, veiculoController.putVeiculo
    /*
        #swagger.tags = ["Veículo"]
        #swagger.summary = "Atualiza veículo por ID"
        #swagger.description = 'Atualiza os dados de um veículo específico pelo ID'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do veículo',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar o veículo',
            required: true,
            schema: { $placa: "MBZ5H21", $modelo: "L-1620", $marca: "Mercedes-Benz", $ano: 2013, ativo: "S" }
        }

        #swagger.responses[200] = {
            description: 'Veículo atualizado',
            schema: { mensagem: 'Veículo atualizado com sucesso!' }
        }
        #swagger.responses[404] = { description: 'Veículo não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o veículo' }
    */
  );

  app.patch("/veiculo/:id", checkPermission.check, veiculoController.patchVeiculo
    /*
        #swagger.tags = ["Veículo"]
        #swagger.summary = "Atualiza parcialmente veículo por ID"
        #swagger.description = 'Atualiza parcialmente os dados de um veículo específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do veículo',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar parcialmente o veículo',
            required: true,
            schema: { placa: "MBZ5H21", modelo: "L-1620", marca: "Mercedes-Benz", ano: 2014, ativo: "N" }
        }

        #swagger.responses[200] = { description: 'Veículo atualizado', schema: { mensagem: 'Veículo atualizado com sucesso!' } }
        #swagger.responses[404] = { description: 'Veículo não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o veículo' }
    */
  );

  app.delete("/veiculo/:id", checkPermission.check, veiculoController.deleteVeiculo
    /*
        #swagger.tags = ["Veículo"]
        #swagger.summary = "Deleta veículo por ID"
        #swagger.description = 'Deleta um veículo específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do veículo',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.responses[204] = {
            description: 'Veículo deletado',
            schema: { mensagem: 'Veículo deletado com sucesso!' }
        }
        #swagger.responses[404] = { description: 'Veículo não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar o veículo' }
    */
  );
};
