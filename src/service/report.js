const db = require('../configs/pg')

function fmtBRL (n) {
  const v = Number(n || 0)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function fmtDateBR (iso) {
  if (!iso) return null
  const s = String(iso)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return `${s.slice(8,10)}/${s.slice(5,7)}/${s.slice(0,4)}`
  }
  const d = new Date(s)
  if (isNaN(d)) return null
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`
}
function fmtTimeHM (hhmmss) {
  if (!hhmmss) return null
  const s = String(hhmmss)
  return s.length >= 5 ? s.slice(0, 5) : s
}
function joinClean (...parts) {
  return parts.filter(p => String(p || '').trim().length).join(' ')
}
function addressLine ({ logradouro, numero, bairro, cidade_nome, uf_sigla, cep }) {
  const ruaNum = [logradouro, numero].filter(Boolean).join(', ')
  const baiCidUf = [bairro, cidade_nome && `— ${cidade_nome}/${uf_sigla || ''}`].filter(Boolean).join(' ')
  const cepStr = cep ? `CEP ${cep}` : null
  return [ruaNum, baiCidUf, cepStr].filter(Boolean).join(' · ')
}
function buildBranding () {
  return {
    name: 'FLOSS LIMPEZA DE FOSSAS',
    cnpj: '22.662.674/0001-94',
    phone: '',
    email: '',
    site: '',
    logoUrl: 'C:\repos\eFLTF-front\efltf-front\src\assets\logo.png',
    address: 'Comunidade Anta Gorda SN, Zona Rural, Pinhalzinho SC, CEP 89870-000',
  }
}

const sql_core = `
  SELECT
    o.ord_id                         AS ord_id,
    o.cli_id,
    o.end_id,
    o.stt_id,
    o.ORD_RESPONSAVEL                AS usu_id,
    o.vei_id,
    o.ord_observacao                 AS observacao,
    o.ord_data                       AS ord_data_iso,
    o.ord_hora                       AS ord_hora,
    c.cli_nome                       AS cliente_nome,
    c.cli_cnpj                       AS cliente_doc,
    c.cli_ddi                        AS cliente_ddi,
    c.cli_ddd                        AS cliente_ddd,
    c.cli_fone                       AS cliente_fone,
    e.cli_logradouro                 AS end_logradouro,
    e.cli_numero                     AS end_numero,
    e.cli_bairro                     AS end_bairro,
    e.cli_cep                        AS end_cep,
    cid.cid_nome                     AS cidade_nome,
    uf.uf_sigla                      AS uf_sigla,
    s.stt_nome                       AS status_nome,
    r.usu_nome                       AS responsavel_nome,
    v.vei_placa                      AS veiculo_placa,
    v.vei_modelo                     AS veiculo_modelo,
    v.vei_marca                      AS veiculo_marca
  FROM t_ordem o
  LEFT JOIN t_cliente        c   ON c.cli_id = o.cli_id
  LEFT JOIN t_endercli       e   ON e.end_id = o.end_id
  LEFT JOIN t_cidade         cid ON cid.cid_id = e.cid_id
  LEFT JOIN t_uf             uf  ON uf.uf_id = cid.uf_id
  LEFT JOIN t_status         s   ON s.stt_id = o.stt_id
  LEFT JOIN t_usuresponsavel r   ON r.usu_id = o.ORD_RESPONSAVEL
  LEFT JOIN t_veiculo        v   ON v.vei_id = o.vei_id
  WHERE o.ord_id = $1
  LIMIT 1
`

// Parcelas/ pagamentos da OS
const sql_pagamentos = `
  SELECT
    p.opg_id            AS id,
    p.opg_parcela       AS parcela,
    p.opg_valor         AS valor,
    p.opg_vencimento    AS vencimento,
    p.opg_pago          AS pago,
    f.fpg_nome          AS forma_nome
  FROM T_ORDPAG p
  LEFT JOIN T_FORMAPAG f ON f.fpg_id = p.fpg_id
  WHERE p.ord_id = $1
  ORDER BY p.opg_parcela ASC, p.opg_id ASC
`
const getRelatorioOS = async (ordId) => {
  try {
    const coreRes = await db.query(sql_core, [ordId])
    if (coreRes.rows.length === 0) {
      throw new Error('NotFound')
    }
    const core = coreRes.rows[0]

    const pagRes = await db.query(sql_pagamentos, [ordId])
    const pagamentos = pagRes.rows || []

    const total  = pagamentos.reduce((s, p) => s + Number(p.valor || 0), 0)
    const pago   = pagamentos.reduce((s, p) => s + (p.pago === 'S' ? Number(p.valor || 0) : 0), 0)
    const aberto = total - pago

    const dataBR = fmtDateBR(core.ord_data_iso)
    const horaHM = fmtTimeHM(core.ord_hora)
    const enderecoStr = addressLine({
      logradouro:  core.end_logradouro,
      numero:      core.end_numero,
      bairro:      core.end_bairro,
      cidade_nome: core.cidade_nome,
      uf_sigla:    core.uf_sigla,
      cep:         core.end_cep
    })

    const brandInfo = buildBranding()

    const item = {
      meta: {
        report: 'Ordem de Serviço',
        generatedAtISO: new Date().toISOString(),
        generatedAtBR: fmtDateBR(new Date().toISOString()),
        page: { size: 'A4', marginMM: { top: 16, right: 12, bottom: 18, left: 12 } }
      },
      brand: brandInfo,

      header: {
        ord_id: core.ord_id,
        status: core.status_nome || '',
        dataBR,
        hora: horaHM
      },

      customer: {
        id: core.cli_id,
        nome: core.cliente_nome || '',
        doc: core.cliente_doc || '',
        contato: joinClean(
          core.cliente_ddi ? `+${core.cliente_ddi}` : null,
          core.cliente_ddd ? `(${core.cliente_ddd})` : null,
          core.cliente_fone || ''
        )
      },

      address: {
        id: core.end_id,
        logradouro: core.end_logradouro || '',
        numero: core.end_numero || '',
        bairro: core.end_bairro || '',
        cidade: core.cidade_nome || '',
        uf: core.uf_sigla || '',
        cep: core.end_cep || '',
        line: enderecoStr
      },

      order: {
        observacao: core.observacao || '',
        responsavel: { id: core.usu_id, nome: core.responsavel_nome || '' },
        veiculo: {
          id: core.vei_id,
          placa: core.veiculo_placa || '',
          modelo: core.veiculo_modelo || '',
          marca: core.veiculo_marca || '',
          line: joinClean(core.veiculo_placa, '—', core.veiculo_modelo, core.veiculo_marca ? `(${core.veiculo_marca})` : '')
        }
      },

      payments: {
        items: pagamentos.map(p => ({
          id: p.id,
          parcela: Number(p.parcela),
          forma: p.forma_nome || '',
          valor: Number(p.valor || 0),
          valor_fmt: fmtBRL(p.valor),
          vencimentoISO: p.vencimento,
          vencimentoBR: fmtDateBR(p.vencimento),
          pago: p.pago === 'S' ? 'S' : 'N'
        })),
        totals: {
          total,
          pago,
          aberto,
          total_fmt: fmtBRL(total),
          pago_fmt: fmtBRL(pago),
          aberto_fmt: fmtBRL(aberto)
        }
      },

      footer: {
        signatures: {
          cliente: { label: 'Assinatura do Cliente' },
          empresa: { label: 'Assinatura da Empresa' }
        },
        terms: [
          'Confirmo a execução/realização do serviço conforme descrito.',
          'Em caso de pagamento em parcelas, o não pagamento de qualquer parcela implicará no vencimento antecipado das demais.'
        ]
      }
    }

    return { item }
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'OS não encontrada' }
    }
    throw { status: 500, message: 'Erro ao montar relatório da OS ' + err.message }
  }
}

module.exports = {
  getRelatorioOS
}
