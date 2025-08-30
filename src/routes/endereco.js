const enderecoController = require("../controllers/endereco");

module.exports = (app) => {
  app.get("/endereco", enderecoController.getEnderecos
    /*
        #swagger.tags = ["Endereço"]
        #swagger.summary = "Lista todos os endereços"
        #swagger.description = 'Retorna a lista completa de endereços cadastrados, incluindo cidade, UF e cliente'

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 2,
                "enderecos": [
                    { 
                        "end_id": 1, 
                        "cli_id": 1,
                        "cli_nome": "Cliente A",
                        "cid_id": 1, 
                        "cid_nome": "São Paulo", 
                        "uf_id": 1,
                        "uf_nome": "São Paulo", 
                        "uf_sigla": "SP",
                        "cli_bairro": "Centro",
                        "cli_logradouro": "Rua A",
                        "cli_cep": "01000-000",
                        "cli_numero": 123,
                        "cli_endereco": "Rua A, 123",
                        "cli_ativo": "S"
                    }
                ]
            }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar endereços' }
    */
  );

  app.get("/endereco/id/:id", enderecoController.getById
    /*
        #swagger.tags = ["Endereço"]
        #swagger.summary = "Consulta endereço por ID"
        #swagger.description = 'Consulta os detalhes de um endereço específico pelo ID, incluindo cidade, UF e cliente'

        #swagger.parameters['id'] = {
            description: 'ID do endereço',
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
                "endereco": { 
                    "end_id": 1, 
                    "cli_id": 1,
                    "cli_nome": "Cliente A",
                    "cid_id": 1, 
                    "cid_nome": "São Paulo", 
                    "uf_id": 1,
                    "uf_nome": "São Paulo", 
                    "uf_sigla": "SP",
                    "cli_bairro": "Centro",
                    "cli_logradouro": "Rua A",
                    "cli_cep": "01000-000",
                    "cli_numero": 123,
                    "cli_endereco": "Rua A, 123",
                    "cli_ativo": "S"
                }
            }
        }
        #swagger.responses[404] = { description: 'Endereço não encontrado' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/endereco", enderecoController.postEndereco
    /*
        #swagger.tags = ["Endereço"]
        #swagger.summary = "Cria um novo endereço"
        #swagger.description = 'Cria um novo endereço no sistema, vinculando a um cliente e cidade existentes'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para criar um novo endereço',
            required: true,
            schema: { $cli_id: 1, $cid_id: 1, $cli_bairro: "Centro", $cli_logradouro: "Rua A", $cli_cep: "01000-000", $cli_numero: 123, $cli_endereco: "Rua A, 123", $cli_ativo: "S" }
        }

        #swagger.responses[201] = {
            description: 'Endereço criado',
            schema: { mensagem: 'Endereço criado com sucesso!', id: 1 }
        }  
        #swagger.responses[400] = { description: 'Cliente ou cidade informada não existe' }
        #swagger.responses[500] = { description: 'Erro ao tentar criar o endereço' }    
    */
  );

  app.put("/endereco/:id", enderecoController.putEndereco
    /*
        #swagger.tags = ["Endereço"]
        #swagger.summary = "Atualiza endereço por ID"
        #swagger.description = 'Atualiza os detalhes de um endereço específico pelo ID, incluindo cliente e cidade'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do endereço',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar o endereço',
            required: true,
            schema: { $cli_id: 1, $cid_id: 1, $cli_bairro: "Centro", $cli_logradouro: "Rua A", $cli_cep: "01000-000", $cli_numero: 123, $cli_endereco: "Rua A, 123", $cli_ativo: "S" }
        }

        #swagger.responses[200] = {
            description: 'Endereço atualizado',
            schema: { mensagem: 'Endereço atualizado com sucesso!' }
        }  
        #swagger.responses[400] = { description: 'Cliente ou cidade informada não existe' }
        #swagger.responses[404] = { description: 'Endereço não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o endereço' }    
    */
  );

  app.patch("/endereco/:id", enderecoController.patchEndereco
    /*
        #swagger.tags = ["Endereço"]
        #swagger.summary = "Atualiza parcialmente endereço por ID"
        #swagger.description = 'Atualiza parcialmente os dados de um endereço específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do endereço',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dados para atualizar parcialmente o endereço',
            required: true,
            schema: { cli_bairro: "Bairro Novo", cli_ativo: "N" }
        }

        #swagger.responses[200] = { description: 'Endereço atualizado', schema: { mensagem: 'Endereço atualizado com sucesso!' } }
        #swagger.responses[400] = { description: 'Cliente ou cidade informada não existe' }
        #swagger.responses[404] = { description: 'Endereço não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar o endereço' }    
    */
  );

  app.delete("/endereco/:id", enderecoController.deleteEndereco
    /*
        #swagger.tags = ["Endereço"]
        #swagger.summary = "Deleta endereço por ID"
        #swagger.description = 'Deleta um endereço específico pelo ID'

        #swagger.parameters['id'] = {
            description: 'ID do endereço',
            in: 'path',
            name: 'id',
            required: true,
            type: 'integer',
            example: 1    
        }

        #swagger.responses[204] = {
            description: 'Endereço deletado',
            schema: { mensagem: 'Endereço deletado com sucesso!' }
        }  
        #swagger.responses[404] = { description: 'Endereço não encontrado' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar o endereço' }    
    */
  );
};
