const ordemController = require("../controllers/ordem");

module.exports = (app) => {
  app.get("/ordem", ordemController.getOrdens
    /*
        #swagger.tags = ["Ordem"]
        #swagger.summary = "Lista todas as ordens"
        #swagger.description = 'Retorna a lista completa de ordens com informações de cliente, endereço, cidade/UF, status e responsável.'

        #swagger.responses[200] = {
          description: 'Sucesso!',
          schema: {
            total: 2,
            items: [
              {
                id: 10,
                cli_id: 1,
                cliente_nome: "ACME Ltda",
                end_id: 5,
                end_logradouro: "Rua das Flores",
                end_numero: "123",
                end_bairro: "Centro",
                end_cep: "89000-000",
                cid_id: 7,
                cidade_nome: "Blumenau",
                uf_sigla: "SC",
                uf_nome: "Santa Catarina",
                stt_id: 1,
                status_nome: "Aberta",
                status_cor: "#00FF00",
                observacao: "Atender cliente pela manhã",
                data: "2025-09-08",
                hora: "09:30",
                responsavel_id: 3,
                responsavel_nome: "João Silva"
              }
            ]
          }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar ordens' }
    */
  );

  app.get("/ordem/id/:id", ordemController.getById
    /*
        #swagger.tags = ["Ordem"]
        #swagger.summary = "Consulta ordem por ID"
        #swagger.description = 'Consulta os detalhes de uma ordem específica pelo ID.'

        #swagger.parameters['id'] = {
          description: 'ID da ordem',
          in: 'path',
          name: 'id',
          required: true,
          type: 'integer',
          example: 10
        }

        #swagger.responses[200] = {
          description: 'Sucesso!',
          schema: {
            total: 1,
            item: {
              id: 10,
              cli_id: 1,
              cliente_nome: "ACME Ltda",
              end_id: 5,
              end_logradouro: "Rua das Flores",
              end_numero: "123",
              end_bairro: "Centro",
              end_cep: "89000-000",
              cid_id: 7,
              cidade_nome: "Blumenau",
              uf_sigla: "SC",
              uf_nome: "Santa Catarina",
              stt_id: 1,
              status_nome: "Aberta",
              status_cor: "#00FF00",
              observacao: "Atender cliente pela manhã",
              data: "2025-09-08",
              hora: "09:30",
              responsavel_id: 3,
              responsavel_nome: "João Silva"
            }
          }
        }
        #swagger.responses[404] = { description: 'Ordem não encontrada' }
        #swagger.responses[500] = { description: 'Erro interno ao tentar fazer a busca' }
    */
  );

  app.post("/ordem", ordemController.postOrdem
    /*
        #swagger.tags = ["Ordem"]
        #swagger.summary = "Cria uma nova ordem"
        #swagger.description = 'Cria uma nova ordem no sistema. Valida cliente, endereço (inclui verificação de pertencimento ao cliente), status e responsável (opcional).'

        #swagger.parameters['obj'] = {
          in: 'body',
          description: 'Dados para criar uma ordem',
          required: true,
          schema: {
            $cli_id: 1,
            $end_id: 5,
            $stt_id: 1,
            observacao: "Atender cliente pela manhã",
            data: "2025-09-08",
            hora: "09:30",
            responsavel_id: 3
          }
        }

        #swagger.responses[201] = {
          description: 'Ordem criada',
          schema: { mensagem: 'Ordem criada com sucesso!', id: 11 }
        }
        #swagger.responses[400] = { description: 'Validação de FK falhou (cliente, endereço, status ou responsável)' }
        #swagger.responses[500] = { description: 'Erro ao tentar criar a ordem' }
    */
  );

  app.put("/ordem/:id", ordemController.putOrdem
    /*
        #swagger.tags = ["Ordem"]
        #swagger.summary = "Atualiza ordem por ID"
        #swagger.description = 'Atualiza todos os campos de uma ordem. Valida FKs e coerência endereço/cliente.'

        #swagger.parameters['id'] = {
          in: 'path',
          description: 'ID da ordem',
          required: true,
          type: 'integer',
          example: 10
        }

        #swagger.parameters['obj'] = {
          in: 'body',
          description: 'Dados para atualizar a ordem',
          required: true,
          schema: {
            $cli_id: 1,
            $end_id: 5,
            $stt_id: 2,
            observacao: "Remarcada para tarde",
            data: "2025-09-09",
            hora: "14:00",
            responsavel_id: 4
          }
        }

        #swagger.responses[200] = {
          description: 'Ordem atualizada',
          schema: { mensagem: 'Ordem atualizada com sucesso!' }
        }
        #swagger.responses[400] = { description: 'Validação de FK falhou (cliente, endereço, status ou responsável)' }
        #swagger.responses[404] = { description: 'Ordem não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar a ordem' }
    */
  );

  app.patch("/ordem/:id", ordemController.patchOrdem
    /*
        #swagger.tags = ["Ordem"]
        #swagger.summary = "Atualiza parcialmente ordem por ID"
        #swagger.description = 'Atualiza parcialmente os campos de uma ordem. FKs são validadas quando informadas.'

        #swagger.parameters['id'] = {
          description: 'ID da ordem',
          in: 'path',
          name: 'id',
          required: true,
          type: 'integer',
          example: 10
        }

        #swagger.parameters['obj'] = {
          in: 'body',
          description: 'Campos a atualizar parcialmente',
          required: true,
          schema: {
            stt_id: 3,
            observacao: "Reagendada",
            hora: "16:00",
            responsavel_id: null
          }
        }

        #swagger.responses[200] = { description: 'Ordem atualizada', schema: { mensagem: 'Ordem atualizada com sucesso!' } }
        #swagger.responses[400] = { description: 'Validação de FK falhou' }
        #swagger.responses[404] = { description: 'Ordem não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar atualizar a ordem' }
    */
  );

  app.delete("/ordem/:id", ordemController.deleteOrdem
    /*
        #swagger.tags = ["Ordem"]
        #swagger.summary = "Deleta ordem por ID"
        #swagger.description = 'Deleta uma ordem específica pelo ID.'

        #swagger.parameters['id'] = {
          description: 'ID da ordem',
          in: 'path',
          name: 'id',
          required: true,
          type: 'integer',
          example: 10
        }

        #swagger.responses[204] = {
          description: 'Ordem deletada',
          schema: { mensagem: 'Ordem deletada com sucesso!' }
        }
        #swagger.responses[404] = { description: 'Ordem não encontrada' }
        #swagger.responses[500] = { description: 'Erro ao tentar deletar a ordem' }
    */
  );
};
