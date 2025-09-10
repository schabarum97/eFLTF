const agendamentoController = require("../controllers/agendamento");

module.exports = (app) => {
  app.get("/agendamento/disponibilidade", agendamentoController.getDisponibilidadeVeiculos
    /*
        #swagger.tags = ["Agendamento"]
        #swagger.summary = "Lista horários livres por veículo"
        #swagger.description = 'Retorna os intervalos (data/hora) disponíveis para todos os veículos ativos no período informado, desconsiderando OS canceladas.'

        #swagger.parameters['de'] = {
            in: 'query',
            description: 'Data inicial (YYYY-MM-DD)',
            required: true,
            type: 'string',
            example: '2025-09-15'
        }
        #swagger.parameters['ate'] = {
            in: 'query',
            description: 'Data final (YYYY-MM-DD)',
            required: true,
            type: 'string',
            example: '2025-09-20'
        }

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
                "total": 6,
                "items": [
                    { "vei_id": 1, "inicio": "2025-09-15T07:00:00.000Z", "fim": "2025-09-15T08:00:00.000Z" },
                    { "vei_id": 1, "inicio": "2025-09-15T07:30:00.000Z", "fim": "2025-09-15T08:30:00.000Z" },
                    { "vei_id": 2, "inicio": "2025-09-15T07:00:00.000Z", "fim": "2025-09-15T08:00:00.000Z" }
                ]
            }
        }
        #swagger.responses[400] = { description: 'Parâmetros obrigatórios ausentes (de, ate)' }
        #swagger.responses[500] = { description: 'Erro interno ao consultar disponibilidade' }
    */
  );
};
