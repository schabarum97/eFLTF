const formaPagController = require("../controllers/formapag");
const checkPermission = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/formapag", checkPermission.check, formaPagController.getFormasPag
    /*
        #swagger.tags = ["Forma de Pagamento"]
        #swagger.summary = "Lista todas as formas de pagamento"
        #swagger.description = 'Retorna a lista completa de formas de pagamento cadastradas'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "items": [
                    { 
                        "id": 1, 
                        "nome": "Dinheiro",
                        "ativo": "S",
                        "parcelado": "N"
                    }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar formas de pagamento' }
    */
  );

  app.get("/formapag/id/:id", checkPermission.check, formaPagController.getById
    /*
        #swagger.tags = ["Forma de Pagamento"]
        #swagger.summary = "Consulta forma de pagamento por ID"
        #swagger.description = 'Consulta os detalhes de uma forma de pagamento específica pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID da forma de pagamento',
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
                "item": { 
                    "id": 1, 
                    "nome": "Cartão de Crédito",
                    "ativo": "S",
                    "parcelado": "S"
                }
            }
        }
        #swagger.responses[404] = { description: 'Forma de Pagamento não encontrada' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/formapag", checkPermission.check, formaPagController.postFormaPag
    /*
        #swagger.tags = ["Forma de Pagamento"]
        #swagger.summary = "Cria uma nova forma de pagamento"
        #swagger.description = 'Cria uma nova forma de pagamento no sistema'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar uma nova forma de pagamento',
            required: true,
            schema: { $nome: "Pix", ativo: "S", parcelado: "N" }
        }

        #swagger.responses[201] = {
            description: 'Forma de Pagamento criada',
            schema: { mensagem: 'Forma de Pagamento criada com sucesso!', id: 1 }
        }  
        #swagger.responses[500] = { description: 'Erro ao tentar criar a forma de pagamento' }    
    */
  );

  app.put("/formapag/:id", checkPermission.check, formaPagController.putFormaPag
    /*
        #swagger.tags = ["Forma de Pagamento"]
        #swagger.summary = "Atualiza forma de pagamento por ID"
        #swagger.description = 'Atualiza os detalhes de uma forma de pagamento específica pelo ID'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da forma de pagamento',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar a forma de pagamento',
            required: true,
            schema: { $nome: "Cartão Débito", ativo: "S", parcelado: "N" }
        }

        #swagger.responses[200] = {
            description: 'Forma de Pagamento atualizada',
            schema: { mensagem: 'Forma de Pagamento atualizada com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Forma de Pagamento não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar a forma de pagamento' }    
    */
  );

  app.patch("/formapag/:id", checkPermission.check, formaPagController.patchFormaPag
    /*
        #swagger.tags = ["Forma de Pagamento"]
        #swagger.summary = "Atualiza parcialmente forma de pagamento por ID"
        #swagger.description = 'Atualiza parcialmente os dados de uma forma de pagamento específica pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID da forma de pagamento',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar parcialmente a forma de pagamento',
            required: true,
            schema: { nome: "Boleto", ativo: "N" }
        }

        #swagger.responses[200] = { description: 'Forma de Pagamento atualizada', schema: { mensagem: 'Forma de Pagamento atualizada com sucesso!' } }
        #swagger.responses[404] = { description: 'Forma de Pagamento não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar a forma de pagamento' }    
    */
  );

  app.delete("/formapag/:id", checkPermission.check, formaPagController.deleteFormaPag
    /*
        #swagger.tags = ["Forma de Pagamento"]
        #swagger.summary = "Deleta forma de pagamento por ID"
        #swagger.description = 'Deleta uma forma de pagamento específica pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID da forma de pagamento',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.responses[204] = {
            description: 'Forma de Pagamento deletada',
            schema: { mensagem: 'Forma de Pagamento deletada com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Forma de Pagamento não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar a forma de pagamento' }    
    */
  );
};
