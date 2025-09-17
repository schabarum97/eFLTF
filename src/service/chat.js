const ordemService    = require('../service/ordem')
const ordempagService = require('../service/ordempag')
const agService       = require('../service/agendamento')
const formaPagService = require('../service/formapag')
const clienteService  = require('../service/cliente')
const enderService    = require('../service/endereco')
const tipolocalService = require('../service/tipolocal')

const sessoes = new Map()

const EMPRESA_NOME = 'Floss Limpeza e Tratamento de Fossas'

const MENU_TEXTO = (nome) =>
  `Olá, ${nome}! Como posso ajudar hoje?\n\n` +
  `1. Solicitar Serviço\n` +
  `2. Verificar Agendamentos Ativos\n` +
  `3. Consultar Serviços Realizados\n` +
  `4. Verificar valores pagos\n` +
  `5. Verificar valores pendentes\n` +
  `6. Cancelar OS\n` +
  `7. Reagendar OS\n` +
  `8. Sair\n\n` + 
  `(Digite "menu" a qualquer momento para recomeçar)`

const MENSAGEM_SEM_MATCH =
  `Sou o assistente virtual da ${EMPRESA_NOME}. ` +
  `Para ver nossas opções de atendimento, digite *menu*.`

const STT_ABERTA      = 1
const STT_ANDAMENTO   = 2
const STT_FINALIZADA  = 3
const STT_CANCELADA   = 4
const STT_AGENDADA    = 5

const STT_ATIVOS      = [STT_ABERTA, STT_ANDAMENTO, STT_AGENDADA]
const STT_REALIZADOS  = [STT_FINALIZADA]

const CANCEL_SEMPRE         = [STT_AGENDADA]
const CANCEL_SOMENTE_FUTURO = [STT_ABERTA]

const MAX_PARCELAS = 6

const PERGUNTA_NOME =
  'Vamos abrir sua solicitação. Qual é o *seu nome completo*?\n' +
  '(Ou digite *cancelar* para voltar ao menu.)'

const PERGUNTA_DOC =
  'Obrigado! Agora informe seu *CPF ou CNPJ* (pode ser com ou sem pontuação).\n' +
  'Ex.: 123.456.789-09 ou 12.345.678/0001-90\n' +
  '(Ou digite *cancelar* para voltar.)'

const PERGUNTA_DATA =
  'Perfeito! Agora, informe a *data desejada* para o serviço.\n' +
  'Formato: *DD/MM/AAAA* (ex.: 25/10/2025)\n' +
  '(Ou digite *cancelar* para voltar ao menu.)'

const PERGUNTA_QTD_PARCELAS =
  'Essa forma de pagamento permite parcelamento.\n' +
  `Em quantas *parcelas* deseja pagar? (1 a ${MAX_PARCELAS})\n` +
  '(Responda só com o número. Ex.: 3)'

const PERGUNTA_USAR_ENDERECO =
  'Encontrei este *endereço utilizado recentemente*:\n' +
  '*{ENDERECO}*\n\n' +
  'Deseja usar este endereço?\n' +
  '1. Sim, usar este endereço\n' +
  '2. Não, informar outro'

function jidParaTelefone(jid) { return String(jid || '').split('@')[0] }
function brl(n) { return (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function soDigitos(s) { return String(s || '').replace(/\D+/g, '') }

function dtBR(d) {
  if (!d) return '—'
  const s = String(d)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const [, yyyy, mm, dd] = m
    return `${dd}/${mm}/${yyyy}`
  }
  const dt = (d instanceof Date) ? d : new Date(d)
  return isNaN(dt) ? '—' : dt.toLocaleDateString('pt-BR')
}

function parseDataParaISO(s) {
  const t = String(s || '').trim()
  let m = t.match(/^(\d{2})[\/](\d{2})[\/](\d{4})$/)
  if (m) {
    const [_, dd, mm, yyyy] = m
    return `${yyyy}-${mm}-${dd}`
  }
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return t
  return null
}
function isDataValidaISO(iso) {
  const d = new Date(iso + 'T00:00:00')
  return !isNaN(d.getTime()) && iso === d.toISOString().slice(0,10)
}
function ehPassado(iso) {
  const hoje = new Date()
  hoje.setHours(0,0,0,0)
  const d = new Date(iso + 'T00:00:00')
  return d < hoje
}
function ehHojeOuPassado(iso) {
  const hoje = new Date()
  hoje.setHours(0,0,0,0)
  const d = new Date(iso + 'T00:00:00')
  return d <= hoje
}

function validarCPF(cpf) {
  const s = soDigitos(cpf)
  if (s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(s[i]) * (10 - i)
  let d1 = 11 - (sum % 11); if (d1 >= 10) d1 = 0
  if (d1 !== parseInt(s[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(s[i]) * (11 - i)
  let d2 = 11 - (sum % 11); if (d2 >= 10) d2 = 0
  return d2 === parseInt(s[10])
}
function validarCNPJ(cnpj) {
  const s = soDigitos(cnpj)
  if (s.length !== 14 || /^(\d)\1{13}$/.test(s)) return false
  const calc = (base) => {
    let pos = base.length - 7, sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * pos--
      if (pos < 2) pos = 9
    }
    let dv = 11 - (sum % 11)
    return dv > 9 ? 0 : dv
  }
  const d1 = calc(s.substring(0, 12))
  const d2 = calc(s.substring(0, 12) + d1)
  return s.endsWith(String(d1) + String(d2))
}
function validarDocumento(doc) {
  const s = soDigitos(doc)
  if (s.length === 11) return validarCPF(s)
  if (s.length === 14) return validarCNPJ(s)
  return false
}

function normalizarCep(s) {
  const d = soDigitos(s)
  if (d.length !== 8) return null
  return d.slice(0, 5) + '-' + d.slice(5)
}
function parseCidadeUf(s) {
  const t = String(s || '').trim()
  let m = t.match(/^(.+?)[\/,\-]\s*([A-Za-z]{2})$/) || t.match(/^(.+?)\s+([A-Za-z]{2})$/)
  if (!m) return null
  const cidade = m[1].trim()
  const uf = (m[2] || '').trim().toUpperCase()
  if (!cidade || uf.length !== 2) return null
  return { cidade, uf }
}
function parseEndereco(input) {
  const texto = String(input || '').replace(/\s+/g, ' ').trim()
  const mCep = texto.match(/(\d{5})[-\s]?(\d{3})\b/)
  if (!mCep) return { erro: 'Informe o CEP (8 dígitos).' }
  const cep = normalizarCep(mCep[0])
  if (!cep) return { erro: 'CEP inválido.' }
  const semCep = texto.replace(mCep[0], '').replace(/[-–—]\s*$/, '').trim()

  const partes = semCep.split('-').map(p => p.trim()).filter(Boolean)
  if (partes.length < 3) {
    return { erro: 'Formato incompleto. Use: Rua, Número - Bairro - Cidade/UF - CEP' }
  }
  const cidadeUfStr = partes[partes.length - 1]
  const bairro = partes[partes.length - 2]
  const ruaNumStr = partes.slice(0, partes.length - 2).join(' - ')

  const [logradouroRaw, numeroRaw] = ruaNumStr.split(',').map(s => s && s.trim())
  const logradouro = (logradouroRaw || '')
  let numero = (numeroRaw || '').toLowerCase()

  if (!logradouro || logradouro.length < 3) return { erro: 'Logradouro inválido.' }

  if (!numero) {
    numero = 's/n'
  } else {
    const n = numero.match(/\d+/)
    if (n) numero = n[0]
    else if (numero.includes('s/n') || numero.includes('sn')) numero = 's/n'
    else numero = 's/n'
  }

  if (!bairro || bairro.length < 2) return { erro: 'Bairro inválido.' }

  const ciduf = parseCidadeUf(cidadeUfStr)
  if (!ciduf) return { erro: 'Cidade/UF inválidos. Ex.: São Miguel do Oeste/SC' }

  return {
    logradouro,
    numero,
    bairro,
    cidade: ciduf.cidade,
    uf: ciduf.uf,
    cep
  }
}

function formatEndereco(e) {
  const cepTxt = e.cep ? ` - ${e.cep}` : ''
  return `${e.logradouro}, ${e.numero} - ${e.bairro} - ${e.cidade}/${e.uf}${cepTxt}`
}

function listarHorarios(horarios = []) {
  return horarios.map(h => `• ${h}`).join('\n')
}
function parseHoraParaHHMM(s) {
  const t = String(s || '').trim()
  let m = t.match(/^(\d{1,2})[:h\.\s]?(\d{2})$/i)
  if (m) {
    const hh = parseInt(m[1], 10)
    const mm = parseInt(m[2], 10)
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm < 60) {
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0')
    }
    return null
  }
  m = t.match(/^(\d{1,2})$/)
  if (m) {
    const hh = parseInt(m[1], 10)
    if (hh >= 0 && hh <= 23) {
      return String(hh).padStart(2, '0') + ':00'
    }
  }
  m = t.match(/^(\d{3,4})$/)
  if (m) {
    const digits = m[1].padStart(4, '0')
    const hh = parseInt(digits.slice(0, 2), 10)
    const mm = parseInt(digits.slice(2), 10)
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm < 60) {
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0')
    }
  }
  return null
}

function formatarFormasPag(formas = []) {
  if (!formas.length) return 'Nenhuma forma de pagamento cadastrada.'
  return formas.map((f, i) => {
    const parc = (f.parcelado === 'S') ? 'Sim' : (f.parcelado === 'N' ? 'Não' : '—')
    return `${i + 1}. ${f.nome}${parc !== '—' ? ` (Parcelado: ${parc})` : ''}`
  }).join('\n')
}
function escolherFormaPagPorEntrada(formas = [], entrada) {
  const t = String(entrada || '').trim().toLowerCase()
  const n = Number(t)
  if (!Number.isNaN(n)) {
    if (n >= 1 && n <= formas.length) return formas[n - 1]
    const byId = formas.find(f => Number(f.id) === n)
    if (byId) return byId
  }
  const byName = formas.find(f => String(f.nome || '').toLowerCase().includes(t))
  return byName || null
}
function splitTelefoneBR(telefoneRaw) {
  const d = soDigitos(telefoneRaw)
  if (d.startsWith('55') && d.length >= 12) {
    return { ddi: '55', ddd: d.slice(2, 4), fone: d.slice(4) }
  }
  return { ddi: d.slice(0, 2) || '55', ddd: d.slice(2, 4) || '', fone: d.slice(4) || d }
}
function parseIntSafe(s) {
  const n = parseInt(soDigitos(s), 10)
  return Number.isFinite(n) ? n : null
}
function descreverParcelamento(valorTotal, parcelas) {
  const n = Number(parcelas) || 1
  if (n <= 1) {
    return valorTotal != null ? `À vista: ${brl(valorTotal)}` : 'À vista (valor a definir no ato)'
  }
  if (valorTotal == null) return `${n}x (valor a definir no ato)`
  const aproxParcela = valorTotal / n
  return `${n}x de ${brl(aproxParcela)} (total ${brl(valorTotal)})`
}

const removerAcentos = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
function formatarTiposLocal(tipos = []) {
  if (!tipos.length) return 'Nenhum tipo de local cadastrado.'
  return tipos.map((t, i) => {
    const preco = (t.valor == null) ? 'a definir no ato' : brl(t.valor)
    return `${i + 1}. ${t.nome} — ${preco}`
  }).join('\n')
}
function escolherTipoLocalPorEntrada(tipos = [], entrada) {
  const txt = String(entrada || '').trim()
  const tnorm = removerAcentos(txt.toLowerCase())

  const n = parseIntSafe(txt)
  if (n && n >= 1 && n <= tipos.length) return tipos[n - 1]

  const byId = tipos.find(t => String(t.id) === txt)
  if (byId) return byId

  return tipos.find(t => removerAcentos(String(t.nome||'').toLowerCase()).includes(tnorm)) || null
}

function normalizarStt(os) {
  if (os.stt_id) return Number(os.stt_id)
  const nome = String(os.status_nome || os.stt_nome || '').toUpperCase()
  if (nome.includes('AGUARDANDO')) return STT_AGENDADA
  if (nome.includes('ANDAMENTO'))  return STT_ANDAMENTO
  if (nome.includes('ABERTA'))     return STT_ABERTA
  if (nome.includes('FINALIZ'))    return STT_FINALIZADA
  if (nome.includes('CANCEL'))     return STT_CANCELADA
  return null
}
function dataIsoDaOS(os) {
  const raw = os.data || os.ord_data
  if (!raw) return null
  const d = new Date(raw)
  if (!isNaN(d)) return d.toISOString().slice(0,10)
  const s = String(raw)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? m[0] : null
}
function podeCancelarOS(os) {
  const stt = normalizarStt(os)
  const iso = dataIsoDaOS(os)
  if (!stt || !iso) return false
  if (CANCEL_SEMPRE.includes(stt)) return true
  if (CANCEL_SOMENTE_FUTURO.includes(stt)) return !ehHojeOuPassado(iso)
  return false
}
const podeReagendarOS = podeCancelarOS

function extrairEnderecoDaOS(o) {
  const e = {
    logradouro: o.end_logradouro || o.logradouro || o.endereco || '',
    numero:     o.end_numero     || o.numero     || 's/n',
    bairro:     o.end_bairro     || o.bairro     || '',
    cidade:     o.cidade_nome    || o.cidade     || '',
    uf:         o.uf_sigla       || o.uf         || '',
    cep:        o.end_cep        || o.cep        || null
  }
  if (!e.logradouro || e.logradouro.length < 3) return null
  if (!e.bairro || !e.cidade || !e.uf) return null
  return e
}

function formatarPagamentos(items = [], titulo = 'Pagamentos', total = null) {
  const toNumber = (x) => {
    if (x == null) return null
    const n = Number((x.total ?? x.soma ?? x).toString().replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  const soma = toNumber(total)

  if (!Array.isArray(items) || items.length === 0) {
    return `*${titulo}:*\n\nNenhum pagamento encontrado.` +
           (soma != null ? `\n\n*Total:* ${brl(soma)}` : '')
  }

  const linhas = items.map((p) => {
    const ord     = p.ord_id ?? p.os_id ?? p.ordem_id ?? p.id_ordem ?? '—'
    const valor   = Number(p.valor ?? p.orp_valor ?? p.total ?? 0)
    const parcelas= Number(p.parcela ?? p.parcelas ?? 1)
    const vencRaw = p.vencimento ?? p.venc ?? p.data_venc ?? p.venc_data ?? p.data
    const forma   = p.fpg_nome ?? p.forma_pag ?? p.forma ?? p.forma_nome ?? null
    const status  = (p.pago === 'S' || String(p.status || '').toUpperCase() === 'PAGO') ? 'Pago' : 'Pendente'

    const parcTxt  = parcelas > 1 ? ` — Parcelas: ${parcelas}x` : ''
    const formaTxt = forma ? ` — Forma: ${forma}` : ''
    const vencTxt  = vencRaw ? `\n  Vencimento: ${dtBR(vencRaw)}` : ''

    return `• OS #${ord} — ${status}\n  Valor: ${brl(valor)}${parcTxt}${vencTxt}${formaTxt}`
  }).join('\n\n')

  return `*${titulo}:*\n\n${linhas}` + (soma != null ? `\n\n*Total:* ${brl(soma)}` : '')
}

function obterSessao(chave, padrao = {}) {
  if (!sessoes.has(chave)) {
    sessoes.set(chave, { estado: 'MENU', usuario: {}, ...padrao })
  }
  return sessoes.get(chave)
}

async function carregarTiposLocal(sessao) {
  if (Array.isArray(sessao.tipos_local) && sessao.tipos_local.length) return sessao.tipos_local
  const { items = [] } = await tipolocalService.getTiposLocalAtivos()
  sessao.tipos_local = items.map(r => ({
    id: r.id,
    nome: r.nome,
    valor: (r.valor === null || r.valor === undefined) ? null : Number(r.valor),
    ativo: r.ativo || 'S'
  }))
  return sessao.tipos_local
}

async function tratarMensagem({ de, nome, texto, enviar }) {
  const msg = String(texto || '').trim()
  const sessao = obterSessao(de, { usuario: { nome } })

  // comandos universais
  if (/^(menu|oi|olá|ola|bom dia|boa tarde|boa noite)$/i.test(msg)) {
    sessao.estado = 'MENU'
    sessao.solicitacao = {}
    await enviar(MENU_TEXTO(nome))
    return
  }
  if (/^(cancelar|voltar)$/i.test(msg)) {
    sessao.estado = 'MENU'
    sessao.solicitacao = {}
    await enviar('Fluxo cancelado. Aqui está o menu novamente:')
    await enviar(MENU_TEXTO(nome))
    return
  }

  // ===== MENU =====
  if (sessao.estado === 'MENU') {
    if (/^[1-8]$/.test(msg)) {
      const opcoes = {
        1: 'Solicitar Serviço',
        2: 'Agendamentos Ativos',
        3: 'Serviços Realizados',
        4: 'Valores pagos',
        5: 'Valores pendentes',
        6: 'Cancelar OS',
        7: 'Reagendar OS',
        8: 'Sair'
      }
      const escolhido = opcoes[msg]

      // (1) solicitar
      if (msg === '1') {
        sessao.estado = 'COLETAR_NOME'
        sessao.solicitacao = { cliente: { telefone: jidParaTelefone(de) } }
        await enviar(PERGUNTA_NOME)
        return
      }

      // (2)/(3) consultas
      if (msg === '2' || msg === '3') {
        const telefone = jidParaTelefone(de)
        const categoria = msg === '2' ? 'ativos' : 'realizados'
        try {
          let stt_ids = null
          if (categoria === 'ativos') stt_ids = STT_ATIVOS
          else if (categoria === 'realizados') stt_ids = STT_REALIZADOS

          const { items = [] } = await ordemService.getOrdensPorTelefone({ telefone, stt_ids })
          if (!items.length) {
            await enviar(`Nenhuma ordem encontrada na categoria **${categoria}** para seu número.`)
          } else {
            const linhas = items.slice(0, 5).map((o) => {
              const data = o.data ? new Date(o.data).toLocaleDateString('pt-BR') : '—'
              const hora = o.hora ?? '—'
              const end  = `${o.end_logradouro}, ${o.end_numero} - ${o.end_bairro} (${o.cidade_nome}/${o.uf_sigla})`
              return `• OS #${o.id} — ${o.status_nome}\n  Data/Hora: ${data} ${hora}\n  Endereço: ${end}`
            })
            const cab = msg === '2' ? '*Seus agendamentos ativos:*' : '*Seus serviços realizados:*'
            await enviar(`${cab}\n\n${linhas.join('\n\n')}`)
            if (items.length > 5) await enviar(`(+${items.length - 5} registros )`)
          }
        } catch (e) {
          await enviar('⚠️ Não consegui consultar suas ordens agora. ' + (e?.message || e))
        }
        await enviar('Digite "menu" para ver as opções novamente.')
        return
      }

      // (4)/(5) pagamentos
      if (msg === '4' || msg === '5') {
        const telefone = jidParaTelefone(de)
        const pago = (msg === '4') ? 'S' : 'N'
        const titulo = (msg === '4') ? 'Pagamentos efetuados' : 'Pagamentos pendentes'
        try {
          const { items = [] } = await ordempagService.getOrdPagsPorTelefone({ telefone, pago })
          const total = await ordempagService.getSomaOrdPagsPorTelefone({ telefone, pago })
          await enviar(formatarPagamentos(items, titulo, total))
        } catch (e) {
          await enviar('⚠️ Não consegui consultar seus pagamentos agora. ' + (e?.message || e))
        }
        await enviar('Digite "menu" para ver as opções novamente.')
        return
      }

      // (6) CANCELAR OS
      if (msg === '6') {
        const telefone = jidParaTelefone(de)
        try {
          const { items = [] } = await ordemService.getOrdensPorTelefone({
            telefone,
            stt_ids: [...CANCEL_SEMPRE, ...CANCEL_SOMENTE_FUTURO]
          })
          const elegiveis = items.filter(podeCancelarOS)
          if (!elegiveis.length) {
            await enviar('Não encontrei nenhuma OS elegível para cancelamento pelo seu número.')
            await enviar('Digite "menu" para ver as opções novamente.')
            return
          }
          sessao.cancelar = {
            lista: elegiveis.map((o) => ({
              id: o.id,
              stt_id: normalizarStt(o),
              status: o.status_nome || o.stt_nome || '',
              data: dataIsoDaOS(o),
              end_id: o.end_id,
              hora: o.hora || o.ord_hora || '—'
            }))
          }
          sessao.estado = 'CANCELAR_ESCOLHA'
          const linhas = sessao.cancelar.lista.map((o, i) =>
            `${i + 1}. OS #${o.id} — ${o.status} — ${dtBR(o.data)} ${o.hora}`
          ).join('\n')
          await enviar(`*OS elegíveis para cancelamento:*\n\n${linhas}\n\nEnvie o *número* da lista ou o *ID da OS*.`)
          return
        } catch (e) {
          await enviar('⚠️ Não consegui listar suas OS agora. ' + (e?.message || e))
          await enviar('Digite "menu" para ver as opções novamente.')
          return
        }
      }

      // (7) REAGENDAR OS
      if (msg === '7') {
        const telefone = jidParaTelefone(de)
        try {
          const { items = [] } = await ordemService.getOrdensPorTelefone({
            telefone,
            stt_ids: [...CANCEL_SEMPRE, ...CANCEL_SOMENTE_FUTURO]
          })
          const elegiveis = items.filter(podeReagendarOS)
          if (!elegiveis.length) {
            await enviar('Não encontrei nenhuma OS elegível para *reagendamento* pelo seu número.')
            await enviar('Digite "menu" para ver as opções novamente.')
            return
          }
          sessao.reagendar = {
            lista: elegiveis.map((o) => ({
              id: o.id,
              stt_id: normalizarStt(o),
              status: o.status_nome || o.stt_nome || '',
              data: dataIsoDaOS(o),
              end_id: o.end_id,
              hora: o.hora || o.ord_hora || '—'
            }))
          }
          sessao.estado = 'REAG_ESCOLHA'
          const linhas = sessao.reagendar.lista.map((o, i) =>
            `${i + 1}. OS #${o.id} — ${o.status} — ${dtBR(o.data)} ${o.hora}`
          ).join('\n')
          await enviar(`*OS elegíveis para reagendamento:*\n\n${linhas}\n\nEnvie o *número* da lista ou o *ID da OS*.`)
          return
        } catch (e) {
          await enviar('⚠️ Não consegui listar suas OS agora. ' + (e?.message || e))
          await enviar('Digite "menu" para ver as opções novamente.')
          return
        }
      }

      // (8) sair
      if (msg === '8') {
        await enviar('Obrigado por entrar em contato! Até mais.')
        sessao.estado = 'MENU'
        return
      }

      await enviar(`⚠️ Você escolheu: ${escolhido}. Opção inválida`)
      await enviar('Digite "menu" para ver as opções novamente.')
      return
    }

    await enviar(MENSAGEM_SEM_MATCH)
    return
  }

  if (sessao.estado === 'CANCELAR_ESCOLHA') {
    const lista = sessao.cancelar?.lista || []
    if (!lista.length) {
      sessao.estado = 'MENU'
      await enviar('Perdi a lista de OS. Vamos voltar ao menu.')
      await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
      return
    }
    const t = msg.trim()
    let escolhida = null
    const n = parseIntSafe(t)
    if (n && n >= 1 && n <= lista.length) escolhida = lista[n - 1]
    if (!escolhida) escolhida = lista.find(o => String(o.id) === t)
    if (!escolhida) {
      const linhas = lista.map((o, i) =>
        `${i + 1}. OS #${o.id} — ${o.status} — ${dtBR(o.data)} ${o.hora}`
      ).join('\n')
      await enviar(`Não entendi. Escolha um *número* ou *ID* da lista:\n\n${linhas}`)
      return
    }
    sessao.cancelar.escolhida = escolhida
    sessao.estado = 'CANCELAR_MOTIVO'
    await enviar(
      `Você selecionou a *OS #${escolhida.id}* (${escolhida.status} — ${dtBR(escolhida.data)} ${escolhida.hora}).\n\n` +
      `Informe o *motivo do cancelamento* (texto livre, obrigatório).`
    )
    return
  }

  if (sessao.estado === 'CANCELAR_MOTIVO') {
    const motivo = msg.trim()
    if (motivo.length < 3) {
      await enviar('Por favor, descreva um *motivo* (mínimo 3 caracteres).')
      return
    }
    sessao.cancelar.motivo = motivo
    sessao.estado = 'CANCELAR_CONFIRMAR'
    const o = sessao.cancelar.escolhida
    await enviar(
      `*Confirmar cancelamento?*\n` +
      `• OS: #${o.id}\n` +
      `• Status atual: ${o.status}\n` +
      `• Data/Hora: ${dtBR(o.data)} ${o.hora}\n` +
      `• Motivo: ${motivo}\n\n` +
      `1. Confirmar cancelamento\n` +
      `2. Desistir`
    )
    return
  }

  if (sessao.estado === 'CANCELAR_CONFIRMAR') {
    if (!/^[12]$/.test(msg)) {
      await enviar('Responda com *1* para confirmar ou *2* para desistir.')
      return
    }
    if (msg === '2') {
      sessao.estado = 'MENU'
      sessao.cancelar = null
      await enviar('Cancelamento abortado. Voltei ao menu.')
      await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
      return
    }
    const chosen = sessao.cancelar?.escolhida
    const motivo = sessao.cancelar?.motivo
    if (!chosen || !motivo) {
      sessao.estado = 'MENU'
      sessao.cancelar = null
      await enviar('Perdi o contexto do cancelamento. Voltando ao menu.')
      await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
      return
    }
    try {
      if (!podeCancelarOS(chosen)) {
        await enviar('⚠️ Esta OS não é mais elegível para cancelamento pelas regras atuais.')
        sessao.estado = 'MENU'
        sessao.cancelar = null
        await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
        return
      }
      const ord_id = chosen.id

      let apagados = 0
      const { items: all = [] } = await ordempagService.getOrdPags()
      const meus = all.filter(x => Number(x.ord_id) === Number(ord_id))
      for (const p of meus) { try { await ordempagService.deleteOrdPag(p.id) } catch (_) {} }
      apagados = meus.length

      const obs = `Cancelada via WhatsApp: ${motivo}`
      await ordemService.patchOrdem({ id: ord_id, stt_id: STT_CANCELADA, observacao: obs})

      await enviar(
        `✅ *OS #${ord_id} cancelada com sucesso!*\n` +
        `${apagados ? `Pagamentos removidos: ${apagados}\n` : ''}` +
        `Motivo registrado: ${motivo}`
      )
    } catch (e) {
      await enviar('⚠️ Erro ao cancelar a OS: ' + (e?.message || e))
    }
    sessao.estado = 'MENU'
    sessao.cancelar = null
    await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
    return
  }

  if (sessao.estado === 'REAG_ESCOLHA') {
    const lista = sessao.reagendar?.lista || []
    if (!lista.length) {
      sessao.estado = 'MENU'
      await enviar('Perdi a lista de OS. Vamos voltar ao menu.')
      await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
      return
    }
    const t = msg.trim()
    let escolhida = null
    const n = parseIntSafe(t)
    if (n && n >= 1 && n <= lista.length) escolhida = lista[n - 1]
    if (!escolhida) escolhida = lista.find(o => String(o.id) === t)
    if (!escolhida) {
      const linhas = lista.map((o, i) =>
        `${i + 1}. OS #${o.id} — ${o.status} — ${dtBR(o.data)} ${o.hora}`
      ).join('\n')
      await enviar(`Não entendi. Escolha um *número* ou *ID* da lista:\n\n${linhas}`)
      return
    }
    sessao.reagendar.escolhida = escolhida
    sessao.estado = 'REAG_DATA'
    await enviar(
      `Você selecionou a *OS #${escolhida.id}* (${escolhida.status} — ${dtBR(escolhida.data)} ${escolhida.hora}).\n\n` +
      PERGUNTA_DATA
    )
    return
  }

  if (sessao.estado === 'REAG_DATA') {
    const iso = parseDataParaISO(msg)
    if (!iso || !isDataValidaISO(iso)) {
      await enviar('Data inválida. Use o formato *DD/MM/AAAA*. Ex.: 25/10/2025')
      return
    }
    if (ehPassado(iso)) {
      await enviar('A nova data já passou. Por favor, envie uma *data futura* (DD/MM/AAAA).')
      return
    }
    try {
      const { horarios = [] } = await agService.getHorariosDisponiveisPorData({ data: iso })
      if (!horarios.length) {
        await enviar(`Não há horários disponíveis em *${dtBR(iso)}*. Informe *outra data* (DD/MM/AAAA).`)
        return
      }
      sessao.reagendar.data = iso
      sessao.reagendar.horarios_disponiveis = horarios
      sessao.estado = 'REAG_HORA'
      await enviar(`*Horários disponíveis em ${dtBR(iso)}:*\n\n${listarHorarios(horarios)}\n\nResponda com o *horário* desejado (ex.: 08:30).`)
      return
    } catch (e) {
      await enviar('⚠️ Não consegui consultar a disponibilidade agora. Tente novamente em instantes.')
      return
    }
  }

  if (sessao.estado === 'REAG_HORA') {
    const disp = sessao.reagendar?.horarios_disponiveis || []
    if (!disp.length) {
      sessao.estado = 'REAG_DATA'
      await enviar('Perdi a lista de horários 😅. Informe novamente a *data* (DD/MM/AAAA).')
      return
    }
    if (/^(ver|listar|opcoes|opções|opcao|opção)$/i.test(msg)) {
      await enviar(`*Horários disponíveis em ${dtBR(sessao.reagendar.data)}:*\n\n${listarHorarios(disp)}\n\nResponda com o *horário* desejado (ex.: 08:30).`)
      return
    }
    const hhmm = parseHoraParaHHMM(msg)
    if (!hhmm || !disp.includes(hhmm)) {
      await enviar(`Horário inválido ou indisponível.\n\n*Disponíveis em ${dtBR(sessao.reagendar.data)}:*\n${listarHorarios(disp)}\n\nResponda com o *horário* exatamente como exibido (ex.: 08:30).`)
      return
    }
    sessao.reagendar.hora = hhmm
    sessao.estado = 'REAG_CONFIRMAR'
    const o = sessao.reagendar.escolhida
    await enviar(
      `*Confirmar reagendamento?*\n` +
      `• OS: #${o.id}\n` +
      `• Data/Hora atual: ${dtBR(o.data)} ${o.hora}\n` +
      `• Nova data/hora: ${dtBR(sessao.reagendar.data)} ${sessao.reagendar.hora}\n\n` +
      `1. Confirmar\n` +
      `2. Desistir`
    )
    return
  }

  if (sessao.estado === 'REAG_CONFIRMAR') {
    if (!/^[12]$/.test(msg)) {
      await enviar('Responda com *1* para confirmar ou *2* para desistir.')
      return
    }
    if (msg === '2') {
      sessao.estado = 'MENU'
      sessao.reagendar = null
      await enviar('Reagendamento abortado. Voltei ao menu.')
      await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
      return
    }

    const chosen = sessao.reagendar?.escolhida
    const novaData = sessao.reagendar?.data
    const novaHora = sessao.reagendar?.hora
    if (!chosen || !novaData || !novaHora) {
      sessao.estado = 'MENU'
      sessao.reagendar = null
      await enviar('Perdi o contexto do reagendamento. Voltando ao menu.')
      await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
      return
    }

    try {
      if (!podeReagendarOS(chosen)) {
        await enviar('⚠️ Esta OS não é mais elegível para reagendamento pelas regras atuais.')
        sessao.estado = 'MENU'
        sessao.reagendar = null
        await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
        return
      }

      const ord_id = chosen.id

      const obs = `Reagendada via WhatsApp: ${dtBR(chosen.data)} ${chosen.hora} → ${dtBR(novaData)} ${novaHora}`
      await ordemService.patchOrdem({
        id: ord_id,
        end_id: chosen.end_id,
        ord_data: novaData,
        ord_hora: novaHora,
        data: novaData, 
        hora: novaHora, 
        observacao: obs
      })

      let removidos = 0
      let recriados = 0
      try {
        const { items: all = [] } = await ordempagService.getOrdPags()
        const meus = all.filter(x => Number(x.ord_id) === Number(ord_id))
        const naoPagos = meus.filter(p => p.pago === 'N')

        for (const p of naoPagos) {
          try { await ordempagService.deleteOrdPag(p.id); removidos++ } catch (_) {}
        }

        if (naoPagos.length) {
          const base = naoPagos[0]
          const fpg_id   = base.fpg_id ?? base.forma_id ?? base.fpg ?? null
          const valorNum = Number(base.valor ?? base.orp_valor ?? 0)
          const parcelas = Number(base.parcela ?? 1)
          if (fpg_id && valorNum > 0) {
            await ordempagService.postOrdPag({
              ord_id,
              fpg_id,
              valor: valorNum,
              parcela: parcelas,
              vencimento: novaData,
              pago: 'N'
            })
            recriados = 1
          }
        }
      } catch (_) { /* não derruba o fluxo */ }

      await enviar(
        `✅ *OS #${ord_id} reagendada com sucesso!*\n` +
        `• Nova data/hora: ${dtBR(novaData)} ${novaHora}\n` +
        (recriados || removidos ? `• Pagamentos reprogramados: removidos ${removidos}, recriado ${recriados}\n` : '')
      )
    } catch (e) {
      await enviar('⚠️ Erro ao reagendar a OS: ' + (e?.message || e))
    }

    sessao.estado = 'MENU'
    sessao.reagendar = null
    await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
    return
  }

  if (sessao.estado === 'COLETAR_NOME') {
    if (msg.length < 3) {
      await enviar('Por favor, informe um *nome* válido (mínimo 3 caracteres).')
      return
    }
    sessao.solicitacao = sessao.solicitacao || {}
    sessao.solicitacao.cliente = {
      ...(sessao.solicitacao.cliente || {}),
      nome: msg.trim(),
      telefone: sessao.solicitacao.cliente?.telefone || jidParaTelefone(de)
    }
    sessao.estado = 'COLETAR_DOC'
    await enviar(PERGUNTA_DOC)
    return
  }

  if (sessao.estado === 'COLETAR_DOC') {
    if (!validarDocumento(msg)) {
      await enviar('Documento inválido. Envie um *CPF* (11 dígitos) ou *CNPJ* (14 dígitos). Pode enviar com ou sem pontuação.')
      return
    }
    const doc = soDigitos(msg)
    sessao.solicitacao = sessao.solicitacao || {}
    sessao.solicitacao.cliente = {
      ...(sessao.solicitacao.cliente || {}),
      documento: doc
    }
    sessao.estado = 'COLETAR_TIPO_LOCAL'

    try {
      const tipos = await carregarTiposLocal(sessao)
      if (!tipos.length) {
        await enviar('⚠️ Não há *tipos de local* cadastrados no momento.')
        sessao.estado = 'MENU'
        await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
        return
      }
      await enviar(
        'Certo! Para começar, escolha o *tipo de local* (responda com o número, ID ou nome):\n\n' +
        formatarTiposLocal(tipos)
      )
    } catch (e) {
      await enviar('⚠️ Não consegui carregar os tipos de local agora. ' + (e?.message || e))
      sessao.estado = 'MENU'
      await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
    }
    return
  }

  if (sessao.estado === 'COLETAR_TIPO_LOCAL') {
    if (/^(ver|listar|opcoes|opções|opcao|opção)$/i.test(msg)) {
      const tipos = await carregarTiposLocal(sessao)
      await enviar(
        'Tipos de local disponíveis:\n\n' + formatarTiposLocal(tipos) +
        '\n\nResponda com o *número*, *ID* ou *nome*.'
      )
      return
    }

    const tipos = await carregarTiposLocal(sessao)
    const escolhido = escolherTipoLocalPorEntrada(tipos, msg)

    if (!escolhido) {
      await enviar(
        'Não entendi o tipo de local.\n\n' +
        'Responda com o *número da lista*, *ID* ou o *nome* (ex.: *Casa*).\n\n' +
        'Para ver as opções novamente, digite *ver*.'
      )
      return
    }

    sessao.solicitacao = {
      ...(sessao.solicitacao || {}),
      tipo_local: { id: escolhido.id, nome: escolhido.nome, valor: escolhido.valor }
    }

    try {
      const telefone = jidParaTelefone(de)
      const { items = [] } = await ordemService.getOrdensPorTelefone({ telefone })
      if (items.length) {
        const ordenadas = items.slice().sort((a, b) => {
          const ai = dataIsoDaOS(a) || '1900-01-01'
          const bi = dataIsoDaOS(b) || '1900-01-01'
          const at = (a.hora || '00:00')
          const bt = (b.hora || '00:00')
          const da = new Date(`${ai}T${at}:00`)
          const db = new Date(`${bi}T${bt}:00`)
          return db - da
        })
        let sug = null
        for (const o of ordenadas) {
          const e = extrairEnderecoDaOS(o)
          if (e) { sug = e; break }
        }
        if (sug) {
          sessao.solicitacao.endereco_sugerido = sug
          sessao.estado = 'ESCOLHER_ENDERECO_ANTERIOR'
          await enviar(
            PERGUNTA_USAR_ENDERECO.replace('{ENDERECO}', formatEndereco(sug))
          )
          return
        }
      }
    } catch (_) {}

    sessao.estado = 'COLETAR_ENDERECO'
    await enviar(
      `Perfeito, tipo de local: *${escolhido.nome}*.\n\n` +
      'Agora me informe o *endereço* no formato:\n' +
      '*Rua, Número - Bairro - Cidade/UF - CEP*\n' +
      'Ex.: *Rua Exemplo, 123 - Centro - São Miguel/SC - 89900-000*\n\n' +
      '(Ou digite *cancelar* para voltar ao menu.)'
    )
    return
  }

  if (sessao.estado === 'ESCOLHER_ENDERECO_ANTERIOR') {
    if (!/^[12]$/.test(msg)) {
      await enviar('Responda com *1* para usar o endereço acima ou *2* para informar outro.')
      return
    }
    if (msg === '1') {
      const end = sessao.solicitacao?.endereco_sugerido
      if (!end) {
        sessao.estado = 'COLETAR_ENDERECO'
        await enviar(
          'Não consegui reaproveitar o endereço agora.\n' +
          'Envie no formato: *Rua, Número - Bairro - Cidade/UF - CEP*'
        )
        return
      }
      sessao.solicitacao.endereco = end
      sessao.estado = 'CONFIRMAR_ENDERECO'
      await enviar(
        `Por favor, confirme os dados do endereço:\n\n` +
        `*${formatEndereco(end)}*\n\n` +
        `1. Confirmar endereço\n` +
        `2. Corrigir endereço`
      )
      return
    }
    sessao.estado = 'COLETAR_ENDERECO'
    await enviar(
      'Sem problemas! Envie o endereço no formato:\n' +
      '*Rua, Número - Bairro - Cidade/UF - CEP*'
    )
    return
  }

  if (sessao.estado === 'COLETAR_ENDERECO') {
    const parsed = parseEndereco(msg)
    if (parsed.erro) {
      await enviar(
        `Não consegui entender o endereço: ${parsed.erro}\n\n` +
        'Envie no formato:\n' +
        '*Rua, Número - Bairro - Cidade/UF - CEP*\n' +
        'Ex.: *Rua Exemplo, 123 - Centro - São Miguel/SC - 89900-000*\n\n' +
        '(Ou digite *cancelar* para voltar ao menu.)'
      )
      return
    }
    sessao.solicitacao = { ...(sessao.solicitacao || {}), endereco: parsed }
    sessao.estado = 'CONFIRMAR_ENDERECO'
    await enviar(
      `Por favor, confirme os dados do endereço:\n\n` +
      `*${formatEndereco(parsed)}*\n\n` +
      `1. Confirmar endereço\n` +
      `2. Corrigir endereço`
    )
    return
  }

  if (sessao.estado === 'CONFIRMAR_ENDERECO') {
    if (!/^[12]$/.test(msg)) {
      await enviar('Responda com *1* para confirmar ou *2* para corrigir o endereço.')
      return
    }
    if (msg === '2') {
      sessao.estado = 'COLETAR_ENDERECO'
      await enviar('Sem problemas! Envie novamente no formato:\n*Rua, Número - Bairro - Cidade/UF - CEP*')
      return
    }
    await enviar('Endereço confirmado ✅')
    sessao.estado = 'COLETAR_DATA'
    await enviar(PERGUNTA_DATA)
    return
  }

  if (sessao.estado === 'COLETAR_DATA') {
    const iso = parseDataParaISO(msg)
    if (!iso || !isDataValidaISO(iso)) {
      await enviar('Data inválida. Use o formato *DD/MM/AAAA*. Ex.: 25/10/2025')
      return
    }
    if (ehPassado(iso)) {
      await enviar('A data informada já passou. Por favor, envie uma *data futura* (DD/MM/AAAA).')
      return
    }
    try {
      const { horarios = [] } = await agService.getHorariosDisponiveisPorData({ data: iso })
      if (!horarios.length) {
        await enviar(`Não há horários disponíveis em *${dtBR(iso)}*. Informe *outra data* (DD/MM/AAAA).`)
        return
      }
      sessao.solicitacao = { ...(sessao.solicitacao || {}), data: iso, horarios_disponiveis: horarios }
      await enviar(`*Horários disponíveis em ${dtBR(iso)}:*\n\n${listarHorarios(horarios)}\n\nResponda com o *horário* desejado (ex.: 08:30).`)
      sessao.estado = 'COLETAR_HORA'
      return
    } catch (e) {
      await enviar('⚠️ Não consegui consultar a disponibilidade agora. Tente novamente em instantes.')
      return
    }
  }

  if (sessao.estado === 'COLETAR_HORA') {
    const disp = sessao.solicitacao?.horarios_disponiveis || []
    if (!disp.length) {
      sessao.estado = 'COLETAR_DATA'
      await enviar('Perdi a lista de horários 😅. Informe novamente a *data* (DD/MM/AAAA).')
      return
    }
    if (/^(ver|listar|opcoes|opções|opcao|opção)$/i.test(msg)) {
      await enviar(`*Horários disponíveis em ${dtBR(sessao.solicitacao.data)}:*\n\n${listarHorarios(disp)}\n\nResponda com o *horário* desejado (ex.: 08:30).`)
      return
    }
    const hhmm = parseHoraParaHHMM(msg)
    if (!hhmm || !disp.includes(hhmm)) {
      await enviar(`Horário inválido ou indisponível.\n\n*Disponíveis em ${dtBR(sessao.solicitacao.data)}:*\n${listarHorarios(disp)}\n\nResponda com o *horário* exatamente como exibido (ex.: 08:30).`)
      return
    }
    sessao.solicitacao.hora = hhmm

    const valor = (sessao.solicitacao?.tipo_local?.valor ?? null)
    sessao.solicitacao.valor_orcado = valor

    try {
      const { items: formas = [] } = await formaPagService.getFormasPag()
      if (!formas.length) {
        await enviar('⚠️ Não há formas de pagamento cadastradas no momento.')
        sessao.estado = 'MENU'
        await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
        return
      }
      sessao.solicitacao.formas_pag = formas
      sessao.estado = 'COLETAR_FORMA_PAG'
      const valorLinha = (valor != null) ? `*Valor do serviço:* ${brl(valor)}` : `*Valor do serviço:* será definido no ato da prestação.`
      await enviar(`${valorLinha}\n\nEscolha a *forma de pagamento*:\n${formatarFormasPag(formas)}\n\nResponda com o *número* da lista (ex.: 1) ou o *nome* (ex.: Boleto).`)
      return
    } catch (e) {
      await enviar('⚠️ Não consegui carregar as formas de pagamento agora. ' + (e?.message || e))
      sessao.estado = 'MENU'
      await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
      return
    }
  }

  if (sessao.estado === 'COLETAR_FORMA_PAG') {
    const formas = sessao.solicitacao?.formas_pag || []
    if (!formas.length) {
      try {
        const { items = [] } = await formaPagService.getFormasPag()
        if (!items.length) {
          await enviar('⚠️ Ainda não encontrei formas de pagamento. Voltando ao menu.')
          sessao.estado = 'MENU'
          await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
          return
        }
        sessao.solicitacao.formas_pag = items
      } catch {
        await enviar('⚠️ Erro ao recuperar formas de pagamento. Voltando ao menu.')
        sessao.estado = 'MENU'
        await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
        return
      }
    }
    if (/^(ver|listar|opcoes|opções|opcao|opção)$/i.test(msg)) {
      await enviar(`Formas disponíveis:\n${formatarFormasPag(sessao.solicitacao.formas_pag)}\n\nResponda com o *número* ou o *nome*.`)
      return
    }
    const escolhido = escolherFormaPagPorEntrada(sessao.solicitacao.formas_pag, msg)
    if (!escolhido) {
      await enviar(`Não entendi sua escolha.\n\nFormas disponíveis:\n${formatarFormasPag(sessao.solicitacao.formas_pag)}\n\nResponda com o *número* da lista (ex.: 1) ou o *nome* (ex.: Boleto).`)
      return
    }
    sessao.solicitacao.pagamento = { fpg_id: escolhido.id, nome: escolhido.nome, parcelado: escolhido.parcelado }
    if (escolhido.parcelado === 'S') {
      sessao.estado = 'COLETAR_QTD_PARCELAS'
      await enviar(PERGUNTA_QTD_PARCELAS)
      return
    }
    sessao.estado = 'CONFIRMAR_AGENDAMENTO'
    const valor = sessao.solicitacao.valor_orcado
    const valorTxt = (valor != null) ? brl(valor) : 'a definir no ato da prestação'
    await enviar(
      `*Resumo do agendamento:*\n` +
      `• Data: ${dtBR(sessao.solicitacao.data)}\n` +
      `• Hora: ${sessao.solicitacao.hora}\n` +
      `• Tipo de local: ${sessao.solicitacao.tipo_local?.nome}\n` +
      `• Endereço: ${formatEndereco(sessao.solicitacao.endereco)}\n` +
      `• Valor: ${valorTxt}\n` +
      `• Forma de pagamento: ${escolhido.nome}\n\n` +
      `• *Fique ciente que o valor da Ordem de Serviço pode ter alguma alteração após a prestação a depender da estrutura do local em que o serviço será prestado*\n\n` +
      `Deseja confirmar?\n1. Confirmar\n2. Trocar forma de pagamento\n3. Escolher outro horário\n4. Cancelar`
    )
    return
  }

  if (sessao.estado === 'COLETAR_QTD_PARCELAS') {
    const n = parseIntSafe(msg)
    if (!n || n < 1 || n > MAX_PARCELAS) {
      await enviar(`Informe um número de *1 a ${MAX_PARCELAS}* (ex.: 3).`)
      return
    }
    sessao.solicitacao.pagamento = { ...(sessao.solicitacao.pagamento || {}), parcelas: n }
    const valor = sessao.solicitacao.valor_orcado
    const valorTxt = (valor != null) ? brl(valor) : 'a definir no ato da prestação'
    const parcTxt  = descreverParcelamento(valor, n)
    sessao.estado = 'CONFIRMAR_AGENDAMENTO'
    await enviar(
      `*Resumo do agendamento:*\n` +
      `• Data: ${dtBR(sessao.solicitacao.data)}\n` +
      `• Hora: ${sessao.solicitacao.hora}\n` +
      `• Tipo de local: ${sessao.solicitacao.tipo_local?.nome}\n` +
      `• Endereço: ${formatEndereco(sessao.solicitacao.endereco)}\n` +
      `• Valor: ${valorTxt}\n` +
      `• Forma de pagamento: ${sessao.solicitacao.pagamento.nome}\n` +
      `• Parcelamento: ${parcTxt}\n\n` +
      `• *Fique ciente que o valor da Ordem de Serviço pode ter alguma alteração após a prestação a depender da estrutura do local em que o serviço será prestado*\n\n` +
      `Deseja confirmar?\n1. Confirmar\n2. Trocar forma de pagamento\n3. Escolher outro horário\n4. Cancelar`
    )
    return
  }

  if (sessao.estado === 'CONFIRMAR_AGENDAMENTO') {
    if (!/^[1-4]$/.test(msg)) {
      await enviar('Responda com *1* Confirmar, *2* Trocar forma, *3* Outro horário, ou *4* Cancelar.')
      return
    }
    if (msg === '2') {
      sessao.estado = 'COLETAR_FORMA_PAG'
      await enviar(`Certo! Escolha novamente a *forma de pagamento*:\n\n${formatarFormasPag(sessao.solicitacao.formas_pag || [])}`)
      return
    }
    if (msg === '3') {
      const disp = sessao.solicitacao?.horarios_disponiveis || []
      if (!disp.length) {
        sessao.estado = 'COLETAR_DATA'
        await enviar('Vamos escolher outra data. Envie a *data* (DD/MM/AAAA).')
        return
      }
      sessao.estado = 'COLETAR_HORA'
      await enviar(`*Horários disponíveis em ${dtBR(sessao.solicitacao.data)}:*\n\n${listarHorarios(disp)}\n\nResponda com o *horário* desejado (ex.: 08:30).`)
      return
    }
    if (msg === '4') {
      await enviar('Tudo bem, cancelamos o fluxo. Se precisar, é só digitar *menu*.')
      sessao.estado = 'MENU'
      return
    }
    if (msg === '1') {
      await enviar('Perfeito! Vou registrar seu agendamento no sistema. ✅')
      try {
        const telJid = jidParaTelefone(de)
        const { ddi, ddd, fone } = splitTelefoneBR(telJid)

        const nomeCli  = sessao.solicitacao?.cliente?.nome || (sessao.usuario?.nome || 'Cliente')
        const cnpj     = sessao.solicitacao?.cliente?.documento
        const endereco = sessao.solicitacao?.endereco
        const tipoLocal = sessao.solicitacao?.tipo_local
        const dataISO   = sessao.solicitacao?.data
        const horaHHMM  = sessao.solicitacao?.hora
        const valor     = sessao.solicitacao?.valor_orcado
        const fpg       = sessao.solicitacao?.pagamento

        if (!endereco || !tipoLocal || !dataISO || !horaHHMM || !fpg) {
          await enviar('⚠️ Faltam dados para confirmar. Vamos recomeçar? Digite *menu*.')
          sessao.estado = 'MENU'
          return
        }

        // Cliente
        const { id: cli_id } = await clienteService.getOuCriarPorTelefone({ nome: nomeCli, ddi, ddd, fone, cnpj })

        // Endereço
        const { id: end_id } = await enderService.criarOuObterEndereco({
          cli_id,
          logradouro: tipoLocal.nome,
          numero: endereco.numero,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          uf: endereco.uf,
          cep: endereco.cep,
          endereco: endereco.logradouro
        })

        // Ordem
        ord_wpp = 'S'
        const { id: ord_id } = await ordemService.postOrdem({
          cli_id,
          end_id,
          stt_id: STT_AGENDADA,
          observacao: `OS aberta via WhatsApp (${tipoLocal.nome})`,
          data: dataISO,
          hora: horaHHMM,
          usu_id: null,
          vei_id: null,
          ord_duracao_min: agService.DEFAULT_DURATION_MIN, 
          tpl_id: tipoLocal.id, 
          ord_wpp
        })

        // Pagamentos
        let parcelasCriadas = 0
        if (valor != null) {
          const parcelas = Number(sessao.solicitacao?.pagamento?.parcelas) || 1
          await ordempagService.postOrdPag({
            ord_id,
            fpg_id: fpg.fpg_id,
            valor: Number(valor),
            parcela: parcelas,
            vencimento: dataISO,
            pago: 'N'
          })
          parcelasCriadas = parcelas
        }

        const valorTxt = (valor != null) ? brl(valor) : 'a definir no ato da prestação'
        await enviar(
          `✅ *Agendamento confirmado!*\n` +
          `• OS: #${ord_id}\n` +
          `• Data/Hora: ${dtBR(dataISO)} ${horaHHMM}\n` +
          `• Cliente: ${nomeCli}\n` +
          `• Endereço: ${formatEndereco(endereco)}\n` +
          `• Valor: ${valorTxt}\n` +
          `• Forma de pagamento: ${fpg.nome}` +
          (valor != null ? `\n• Parcelas: ${parcelasCriadas}x` : '')
        )

        sessao.estado = 'MENU'
        sessao.solicitacao = {}
        await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
        return
      } catch (e) {
        console.error('[BOT][confirmar] erro:', e)
        await enviar('⚠️ Ocorreu um erro ao registrar seu agendamento. ' + (e?.message || e))
        sessao.estado = 'MENU'
        return
      }
    }

    sessao.estado = 'MENU'
    await enviar(MENU_TEXTO(sessao.usuario?.nome || ''))
    return
  }

  await enviar(MENSAGEM_SEM_MATCH)
}

module.exports = { tratarMensagem }
