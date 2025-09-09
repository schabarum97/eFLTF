// src/routes/dash.js
const dashController = require("../controllers/dash");

module.exports = (app) => {
  app.get("/dash/resumo", dashController.getResumo
    /*
        #swagger.tags = ["Dashboard"]
        #swagger.summary = "Resumo geral (KPIs)"
        #swagger.description = 'Retorna KPIs do painel: abertas, atrasadas, vencem_hoje, concluídas no mês, faturamento do mês e ticket médio do mês.'
        #swagger.responses[200] = {
          description: 'Sucesso!',
          schema: {
            "abertas": 12,
            "atrasadas": 3,
            "vencem_hoje": 5,
            "concluidas_mes": 18,
            "faturamento_mes": 12450.75,
            "ticket_medio_mes": 415.02
          }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar resumo do dash' }
    */
  );

  app.get("/dash/por-responsavel", dashController.getPorResponsavel
    /*
        #swagger.tags = ["Dashboard"]
        #swagger.summary = "OS por responsável"
        #swagger.description = 'Agrupa a quantidade de ordens por responsável (inclui "— Sem responsável —").'
        #swagger.responses[200] = {
          description: 'Sucesso!',
          schema: {
            "total": 3,
            "items": [
              { "responsavel": "João Silva", "total": 10 },
              { "responsavel": "Maria Souza", "total": 7 },
              { "responsavel": "— Sem responsável —", "total": 2 }
            ]
          }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar dash por responsável' }
    */
  );

  app.get("/dash/backlog-aging", dashController.getBacklogAging
    /*
        #swagger.tags = ["Dashboard"]
        #swagger.summary = "Backlog por idade"
        #swagger.description = 'Distribuição das OS abertas por faixas de idade (0-2, 3-7, 8-14 e >14 dias).'
        #swagger.responses[200] = {
          description: 'Sucesso!',
          schema: {
            "total": 4,
            "items": [
              { "faixa": "0-2",  "total": 6 },
              { "faixa": "3-7",  "total": 4 },
              { "faixa": "8-14", "total": 2 },
              { "faixa": ">14",  "total": 1 }
            ]
          }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar dash backlog/idade' }
    */
  );

  app.get("/dash/hoje-amanha", dashController.getHojeEAmanha
    /*
        #swagger.tags = ["Dashboard"]
        #swagger.summary = "OS de hoje e amanhã"
        #swagger.description = 'Lista as ordens com data igual a hoje e a amanhã, já prontas para ação.'
        #swagger.responses[200] = {
          description: 'Sucesso!',
          schema: {
            "total": 2,
            "items": [
              {
                "ord_id": 101,
                "cliente": "ACME Tecnologia Ltda",
                "endereco": "Rua do Comércio, 120",
                "responsavel": "João Pedro",
                "ord_data": "2025-09-09",
                "ord_hora": "10:40",
                "status": "EM ANDAMENTO"
              },
              {
                "ord_id": 102,
                "cliente": "Comercial Blumen Vale ME",
                "endereco": "Rua Sete de Setembro, 455",
                "responsavel": "—",
                "ord_data": "2025-09-10",
                "ord_hora": "13:00",
                "status": "ABERTA"
              }
            ]
          }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar dash de hoje e amanhã' }
    */
  );

  app.get("/dash/carga-dia-hora", dashController.getCargaDiaHora
    /*
        #swagger.tags = ["Dashboard"]
        #swagger.summary = "Carga por dia/horário"
        #swagger.description = 'Heatmap: quantidade de OS abertas por dia da semana (0=Dom, ... 6=Sáb) e por hora.'
        #swagger.responses[200] = {
          description: 'Sucesso!',
          schema: {
            "total": 5,
            "items": [
              { "dow": 1, "hora": 8,  "total": 2 },
              { "dow": 1, "hora": 9,  "total": 4 },
              { "dow": 2, "hora": 10, "total": 3 },
              { "dow": 4, "hora": 13, "total": 5 },
              { "dow": 5, "hora": 15, "total": 1 }
            ]
          }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar dash carga dia/hora' }
    */
  );

  app.get("/dash/pagamentos-recentes", dashController.getPagamentosRecentes
    /*
        #swagger.tags = ["Dashboard"]
        #swagger.summary = "Pagamentos recentes"
        #swagger.description = 'Timeline de pagamentos: confirmados ou a vencer (últimos/ próximos 15 dias).'
        #swagger.responses[200] = {
          description: 'Sucesso!',
          schema: {
            "total": 3,
            "items": [
              {
                "ref_id": 201,
                "tipo": "Pagamento confirmado",
                "ts": "2025-09-09T00:00:00.000Z",
                "cliente": "ACME Tecnologia Ltda",
                "status": "FINALIZADA",
                "valor": 320.00
              },
              {
                "ref_id": 202,
                "tipo": "Pagamento a vencer",
                "ts": "2025-09-12T00:00:00.000Z",
                "cliente": "Comercial Blumen Vale ME",
                "status": "EM ANDAMENTO",
                "valor": 150.50
              },
              {
                "ref_id": 203,
                "tipo": "Pagamento confirmado",
                "ts": "2025-09-03T00:00:00.000Z",
                "cliente": "Hospital São Miguel S/A",
                "status": "ABERTA",
                "valor": 890.00
              }
            ]
          }
        }
        #swagger.responses[500] = { description: 'Erro interno ao buscar pagamentos recentes' }
    */
  );
};
