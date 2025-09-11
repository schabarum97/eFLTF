const clienteController = require("../controllers/cliente");
const checkPermission = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/cliente",  checkPermission.check, clienteController.getClientes
    /*
        #swagger.tags = ["Cliente"]
        #swagger.summary = "Lista todos os Clientes"
        #swagger.description = 'Retorna a lista completa de clientes cadastrados'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "clientes": [
                    {
                        "cli_id": 1,
                        "cli_cnpj": "12345678000199",
                        "cli_nome": "Empresa XPTO LTDA",
                        "cli_ddi": "55",
                        "cli_ddd": "11",
                        "cli_fone": "987654321"
                    },
                    {
                        "cli_id": 2,
                        "cli_cnpj": "98765432000188",
                        "cli_nome": "Tech Solutions",
                        "cli_ddi": "55",
                        "cli_ddd": "21",
                        "cli_fone": "123456789"
                    }
                ]
            }
        }
        #swagger.responses[500] = {
            description: 'Erro interno ao buscar clientes'
        }
    */
  );

  app.get("/cliente/id/:id", checkPermission.check, clienteController.getById
    /*
        #swagger.tags = ["Cliente"]
        #swagger.summary = "Consulta Cliente por ID"
        #swagger.description = 'Consulta os detalhes de um Cliente específico pelo ID'
        
        #swagger.parameters['id'] = {
            description: 'ID do Cliente',
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
                "cliente": {
                    "cli_id": 1,
                    "cli_cnpj": "12345678000199",
                    "cli_nome": "Empresa XPTO LTDA",
                    "cli_ddi": "55",
                    "cli_ddd": "11",
                    "cli_fone": "987654321"
                }
            }
        }
        #swagger.responses[404] = {
            description: 'Cliente não encontrado'
        }
        #swagger.responses[500] = {
            description: 'Erro interno ao tentar fazer a busca'
        }
    */
  );

    app.post("/cliente", checkPermission.check, clienteController.postCliente
    /* 
        #swagger.tags = ["Cliente"]
        #swagger.summary = "Cria um novo Cliente"
        #swagger.description = 'Cria um novo Cliente no sistema'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar um novo Cliente',
            required: true,
            schema: {
                $cnpj: "11222333000155",
                $nome: "Nova Empresa",
                $ddi: "55",
                $ddd: "41",
                $fone: "99887766"
            }
        }
        #swagger.responses[201] = {
            description: 'Cliente criado',
            schema: {
                mensagem: 'Cliente criado com sucesso!',
                id: 1
            }
        }  
        #swagger.responses[500] = {
            description: 'Erro ao tentar criar o Cliente',
            schema: {
                mensagem: 'Erro no servidor!'
            }
        }    
    */
    );

  app.put("/cliente/:id", checkPermission.check, clienteController.putCliente
    /*
        #swagger.tags = ["Cliente"]
        #swagger.summary = "Atualiza Cliente por ID"
        #swagger.description = 'Atualiza os detalhes de um Cliente específico pelo ID'
        
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do Cliente',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar o Cliente',
            required: true,
            schema: {
                $cnpj: "11222333000155",
                $nome: "Empresa Atualizada",
                $ddi: "55",
                $ddd: "41",
                $fone: "99887766"
            }
        }

        #swagger.responses[200] = {
            description: 'Cliente atualizado',
            schema: {
                mensagem: 'Cliente atualizado com sucesso!'
            }
        }  
        #swagger.responses[404] = {
            description: 'Cliente não encontrado'
        }
        #swagger.responses[500] = {
            description: 'Erro ao tentar atualizar o Cliente'
        }    
    */
  );

  app.patch("/cliente/:id", checkPermission.check, clienteController.patchCliente
    /* 
        #swagger.tags = ["Cliente"]
        #swagger.summary = "Atualiza parcialmente Cliente por ID"
        #swagger.description = 'Atualiza parcialmente os dados de um Cliente específico pelo ID'
               
        #swagger.parameters['id'] = {
            description: 'ID do Cliente',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar parcialmente o Cliente',
            required: true,
            schema: {
                nome: "Empresa Parcialmente Atualizada"
            }
        }

        #swagger.responses[200] = {
            description: 'Cliente atualizado',
            schema: { mensagem: 'Cliente atualizado com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Cliente não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o Cliente' }    
    */
  );

  app.delete("/cliente/:id", checkPermission.check, clienteController.deleteCliente
    /*
        #swagger.tags = ["Cliente"]
        #swagger.summary = "Deleta Cliente por ID"
        #swagger.description = 'Deleta um Cliente específico pelo ID'
        
        #swagger.parameters['id'] = {
            description: 'ID do Cliente',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.responses[204] = {
            description: 'Cliente deletado',
            schema: {
                mensagem: 'Cliente deletado com sucesso!'
            }
        }  
        #swagger.responses[404] = {
            description: 'Cliente não encontrado'
        }
        #swagger.responses[500] = {
            description: 'Erro ao tentar deletar o Cliente'
        }    
    */
  );
};
