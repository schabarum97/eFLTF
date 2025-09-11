const reportController = require("../controllers/report.js");
const checkPermission = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/report/os/:id", checkPermission.check, reportController.getRelatorioOS
    /*
        #swagger.tags = ["Relatórios"]
        #swagger.summary = "Dados do relatório de OS (view-model)"
        #swagger.description = 'Retorna o objeto pronto para renderização/impressão do relatório de uma Ordem de Serviço.'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da Ordem de Serviço',
            required: true,
            type: 'integer',
            example: 123
        }

        #swagger.responses[200] = {
            description: 'Sucesso!',
            schema: {
              item: {
                meta: {
                  report: "Ordem de Serviço",
                  generatedAtISO: "2025-09-10T12:34:56.000Z",
                  generatedAtBR: "10/09/2025",
                  page: { size: "A4", marginMM: { top: 16, right: 12, bottom: 18, left: 12 } }
                },
                brand: {
                  name: "FLOSS LIMPEZA DE FOSSAS",
                  cnpj: "22.662.674/0001-94",
                  phone: "",
                  email: "",
                  site: "",
                  logoUrl: null,
                  address: "Comunidade Anta Gorda SN, Zona Rural, Pinhalzinho SC, CEP 89870-000"
                },
                header: {
                  ord_id: 123,
                  status: "Agendada",
                  dataBR: "27/08/2025",
                  hora: "09:30"
                },
                customer: {
                  id: 5,
                  nome: "Cliente Exemplo",
                  doc: "123.456.789-00",
                  contato: "+55 (49) 99999-9999"
                },
                address: {
                  id: 77,
                  logradouro: "Rua A",
                  numero: "100",
                  bairro: "Centro",
                  cidade: "Pinhalzinho",
                  uf: "SC",
                  cep: "89870-000",
                  line: "Rua A, 100 · Centro — Pinhalzinho/SC · CEP 89870-000"
                },
                order: {
                  observacao: "Limpeza de fossa séptica.",
                  responsavel: { id: 2, nome: "João Silva" },
                  veiculo: {
                    id: 3,
                    placa: "ABC1D23",
                    modelo: "Caminhão Pipa",
                    marca: "Volvo",
                    line: "ABC1D23 — Caminhão Pipa (Volvo)"
                  }
                },
                payments: {
                  items: [
                    {
                      id: 901,
                      parcela: 1,
                      forma: "PIX",
                      valor: 350,
                      valor_fmt: "R$ 350,00",
                      vencimentoISO: "2025-08-27",
                      vencimentoBR: "27/08/2025",
                      pago: "S"
                    }
                  ],
                  totals: {
                    total: 350,
                    pago: 350,
                    aberto: 0,
                    total_fmt: "R$ 350,00",
                    pago_fmt: "R$ 350,00",
                    aberto_fmt: "R$ 0,00"
                  }
                },
                footer: {
                  signatures: {
                    cliente: { label: "Assinatura do Cliente" },
                    empresa: { label: "Assinatura da Empresa" }
                  },
                  terms: [
                    "Confirmo a execução/realização do serviço conforme descrito.",
                    "Em caso de pagamento em parcelas, o não pagamento de qualquer parcela implicará no vencimento antecipado das demais."
                  ]
                }
              }
            }
        }
        #swagger.responses[400] = { description: 'Parâmetro \"id\" inválido' }
        #swagger.responses[404] = { description: 'OS não encontrada' }
        #swagger.responses[500] = { description: 'Erro interno ao montar relatório' }
    */
  );
};
