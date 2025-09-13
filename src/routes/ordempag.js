const ordPagController = require("../controllers/ordempag");
const checkPermission = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/ordempag", checkPermission.check, ordPagController.getOrdPags
    /*
        #swagger.tags = ["Pagamentos da OS"]
        #swagger.summary = "Lista todos os pagamentos de ordens de serviço"
        #swagger.description = 'Retorna a lista completa de pagamentos, incluindo dados da ordem, cliente e forma de pagamento'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "items": [
                    {
                        "id": 1,
                        "ord_id": 10,
                        "fpg_id": 2,
                        "valor": 100.00,
                        "parcela": 1,
                        "vencimento": "2025-09-10",
                        "pago": "N",
                        "ordem_id": 10,
                        "ordem_data": "2025-09-01",
                        "cli_id": 5,
                        "cliente_nome": "Cliente X",
                        "forma_pagamento_nome": "Cartão de Crédito",
                        "forma_pagamento_parcelado": "S"
                    }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar pagamentos' }
    */
  );

  app.get("/ordempag/id/:id", checkPermission.check, ordPagController.getById
    /*
        #swagger.tags = ["Pagamentos da OS"]
        #swagger.summary = "Consulta pagamento por ID"
        #swagger.description = 'Consulta os detalhes de um pagamento específico da OS'

        #swagger.parameters['id'] = {
            description: 'ID do pagamento',
            in: 'path',
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
                    "ord_id": 10,
                    "fpg_id": 2,
                    "valor": 100.00,
                    "parcela": 1,
                    "vencimento": "2025-09-10",
                    "pago": "N",
                    "ordem_id": 10,
                    "ordem_data": "2025-09-01",
                    "cli_id": 5,
                    "cliente_nome": "Cliente X",
                    "forma_pagamento_nome": "Cartão de Crédito",
                    "forma_pagamento_parcelado": "S"
                }
            }
        }
        #swagger.responses[404] = { description: 'Pagamento não encontrado' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar buscar' }
    */
  );

  app.post("/ordempag", checkPermission.check, ordPagController.postOrdPag
    /*
        #swagger.tags = ["Pagamentos da OS"]
        #swagger.summary = "Cria novos pagamentos da OS"
        #swagger.description = 'Cria registros de pagamentos para uma ordem de serviço, permitindo parcelamento'

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar os pagamentos',
            required: true,
            schema: {
                $ord_id: 10,
                $fpg_id: 2,
                $valor: 300.00,
                $parcela: 3,
                $vencimento: "2025-09-10",
                pago: "N"
            }
        }

        #swagger.responses[201] = {
            description: 'Pagamentos criados',
            schema: { mensagem: 'Pagamentos da OS criados com sucesso!', ids: [1,2,3], parcelas: 3 }
        }
        #swagger.responses[400] = { description: 'Erro de validação (ordem ou forma de pagamento inválida)' }
        #swagger.responses[500] = { description: 'Erro ao tentar criar os pagamentos' }
    */
  );

  app.put("/ordempag/:id", checkPermission.check, ordPagController.putOrdPag
    /*
        #swagger.tags = ["Pagamentos da OS"]
        #swagger.summary = "Atualiza pagamento por ID"
        #swagger.description = 'Atualiza todos os dados de um pagamento da OS'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do pagamento',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados do pagamento',
            required: true,
            schema: {
                $ord_id: 10,
                $fpg_id: 2,
                $valor: 100.00,
                $parcela: 1,
                $vencimento: "2025-09-10",
                $pago: "S"
            }
        }

        #swagger.responses[200] = { description: 'Pagamento atualizado', schema: { mensagem: 'Pagamento da OS atualizado com sucesso!' } }
        #swagger.responses[404] = { description: 'Pagamento não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o pagamento' }
    */
  );

  app.patch("/ordempag/:id", checkPermission.check, ordPagController.patchOrdPag
    /*
        #swagger.tags = ["Pagamentos da OS"]
        #swagger.summary = "Atualiza parcialmente pagamento por ID"
        #swagger.description = 'Atualiza apenas os campos informados de um pagamento da OS'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do pagamento',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Campos a atualizar',
            required: true,
            schema: { pago: "S" }
        }

        #swagger.responses[200] = { description: 'Pagamento atualizado', schema: { mensagem: 'Pagamento da OS atualizado com sucesso!' } }
        #swagger.responses[404] = { description: 'Pagamento não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o pagamento' }
    */
  );

  app.delete("/ordempag/:id", checkPermission.check, ordPagController.deleteOrdPag
    /*
        #swagger.tags = ["Pagamentos da OS"]
        #swagger.summary = "Deleta pagamento por ID"
        #swagger.description = 'Remove um pagamento específico da OS'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do pagamento',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.responses[204] = { description: 'Pagamento deletado', schema: { mensagem: 'Pagamento da OS deletado com sucesso!' } }
        #swagger.responses[404] = { description: 'Pagamento não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar o pagamento' }
    */
  );
  app.get('/ordempag/por-telefone', ordPagController.getPorTelefone);
};
