const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { Client, LocalAuth } = require('whatsapp-web.js')
const chatService = require('./service/chat.js')

let client = null
let status = 'idle'
let lastQr = null

const SESSION_ID      = process.env.SESSION_ID    || 'default'
const WPP_DATA_PATH   = process.env.WPP_DATA_PATH || './.wpp-auth'
const LA_USER_DATA_DIR = path.join(WPP_DATA_PATH, `session-${SESSION_ID}`)

// reconexão automática
const reconnect = {
  enabled: true,
  attempt: 0,
  timer: null,
  baseMs: 2000,      // 2s
  maxMs: 60000       // 60s
}
let forceQrNextInit = false

function clearReconnect() {
  if (reconnect.timer) clearTimeout(reconnect.timer)
  reconnect.timer = null
  reconnect.attempt = 0
}

function scheduleReconnect(broadcast, reason) {
  if (!reconnect.enabled) return
  // não tenta reconectar se o motivo foi LOGOUT explícito
  if (String(reason || '').toUpperCase() === 'LOGOUT') return

  const delay = Math.min(reconnect.baseMs * Math.pow(2, reconnect.attempt++), reconnect.maxMs)
  const payload = { status: 'reconnecting', attempt: reconnect.attempt, delay }
  broadcast?.('status', payload)

  reconnect.timer = setTimeout(() => {
    try {
      client = null
      initClient(broadcast)
    } catch (e) {
      scheduleReconnect(broadcast, 'RETRY_ERROR')
    }
  }, delay)
}

function cleanChromiumLocks (dir) {
  try {
    const targets = [
      path.join(dir, 'SingletonLock'),
      path.join(dir, 'SingletonCookie'),
      path.join(dir, 'SingletonSocket'),
      path.join(dir, 'Default', 'SingletonLock'),
      path.join(dir, 'Default', 'SingletonCookie'),
      path.join(dir, 'Default', 'SingletonSocket')
    ]
    for (const p of targets) { try { fs.rmSync(p, { force: true }) } catch (_) {} }
  } catch (_) {}
}

function prepareLocalAuthDir () {
  try {
    fs.mkdirSync(LA_USER_DATA_DIR, { recursive: true })
    fs.mkdirSync(path.join(LA_USER_DATA_DIR, 'Default'), { recursive: true })
  } catch (_) {}
  cleanChromiumLocks(LA_USER_DATA_DIR)
}

function hasSavedSession () {
  try {
    if (!fs.existsSync(LA_USER_DATA_DIR)) return false
    const entries = fs.readdirSync(LA_USER_DATA_DIR).filter(n => !n.startsWith('.'))
    return entries.length > 0
  } catch (_) { return false }
}

function pickExecutablePath() {
  const pExec = puppeteer.executablePath && puppeteer.executablePath()
  if (pExec && fs.existsSync(pExec)) return pExec
  const candidates = [
    '/usr/bin/chromium-browser','/usr/bin/chromium',
    '/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
    '/usr/bin/chrome','/usr/bin/chromium64',
  ]
  for (const c of candidates) if (fs.existsSync(c)) return c
  return undefined
}

function logMsg(prefix, m) {
  console.log(prefix, {
    from: m.from, to: m.to, fromMe: m.fromMe,
    body: (m.body || '').slice(0, 120)
  })
}

const CHROME_PATH = pickExecutablePath()

const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu',
  '--profile-directory=Default' 
]

function broadcastExpectQr(broadcast, expect) {
  broadcast?.('status', { status, expectQr: !!expect })
}
function broadcastCertainNeedsQr(broadcast) {
  broadcast?.('status', { status: 'qr', expectQr: true, certainty: 'confirmed' })
}

function initClient(broadcast) {
  if (client) return client

  const predictedQr = forceQrNextInit ? true : !hasSavedSession()
  broadcastExpectQr(broadcast, predictedQr)

  prepareLocalAuthDir()

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: SESSION_ID,
      dataPath: WPP_DATA_PATH
    }),
    puppeteer: {
      executablePath: CHROME_PATH,
      headless: true,
      args: PUPPETEER_ARGS
    }
  })

  client.on('qr', qr => {
    status = 'qr'
    lastQr = qr
    broadcastCertainNeedsQr(broadcast)
    broadcast?.('qr', { qr })
  })

  client.on('authenticated', () => {
    status = 'authenticated'
    lastQr = null
    forceQrNextInit = false
    clearReconnect()
    broadcastExpectQr(broadcast, false)
    broadcast?.('status', { status })
  })

  client.on('ready', () => {
    status = 'ready'
    lastQr = null
    forceQrNextInit = false
    clearReconnect()
    broadcastExpectQr(broadcast, false)
    broadcast?.('status', { status })
  })

  client.on('auth_failure', m => {
    status = 'auth_failure'
    broadcast?.('status', { status, message: m, expectQr: true })
    scheduleReconnect(broadcast, 'AUTH_FAILURE')
  })

  client.on('change_state', (s) => {
    broadcast?.('status', { status: `wa_state:${s}` })
  })

  client.on('disconnected', reason => {
    status = 'disconnected'
    broadcast?.('status', { status, reason })
    client = null
    cleanChromiumLocks(LA_USER_DATA_DIR)
    scheduleReconnect(broadcast, reason)
  })

  client.on('message', async (msg) => {
    try {
      const chat = await msg.getChat()
      if (chat.isGroup) return
      if (msg.to && client.info && msg.to !== client.info.wid._serialized) return
      if (msg.fromMe) return

      const de    = msg.from
      const nome  = (await msg.getContact()).pushname || 'Usuário'
      const texto = msg.body

      const enviar = async (resposta) => client.sendMessage(de, resposta)
      await chatService.tratarMensagem({ de, nome, texto, enviar })
    } catch (e) {
      console.error('[WPP] erro no tratador de mensagens (message):', e)
    }
  })

  ;(async () => {
    try {
      broadcastExpectQr(broadcast, forceQrNextInit || !hasSavedSession())
      cleanChromiumLocks(LA_USER_DATA_DIR)
      await client.initialize()
    } catch (e) {
      status = 'error'
      broadcast?.('status', { status, error: String(e?.message || e), expectQr: true })
      console.error('[WPP] initialize() failed:', e)
      client = null
      scheduleReconnect(broadcast, 'INIT_FAIL')
    }
  })()

  const shutdown = async () => {
    try { if (client) await client.destroy() } catch (_) {}
    cleanChromiumLocks(LA_USER_DATA_DIR)
    process.exit(0)
  }
  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTERM')
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  return client
}

async function disconnect({ hardReset = false } = {}) {
  try {
    // desligo auto-reconnect ANTES
    reconnect.enabled = false
    clearReconnect()
    if (client) {
      try { await client.logout() } catch (_) {}
      try { await client.destroy() } catch (_) {}
    }
  } finally {
    client = null
    status = 'disconnected'
    lastQr = null
    if (hardReset) {
      try { fs.rmSync(LA_USER_DATA_DIR, { recursive: true, force: true }) } catch (_) {}
      forceQrNextInit = true
    } else {
      forceQrNextInit = false
    }
  }
}

function setAutoReconnect(enabled) {
  reconnect.enabled = !!enabled
  if (!enabled) clearReconnect()
}

function getStatus() { return status }
function getLastQr() { return lastQr }
function getReconnectState() {
  return { enabled: reconnect.enabled, attempt: reconnect.attempt }
}

function onlyDigits(s){ return String(s||'').replace(/\D+/g,'') }

function MontaNumero(digits) {
  let d = onlyDigits(digits)

  // garante DDI 55 no início (se já vier, mantém)
  if (!d.startsWith('55')) d = '55' + d

  // remove "0" de tronco após DDI se existir (ex.: 55049... -> 5549...)
  if (d.startsWith('550')) d = '55' + d.slice(3)

  const base = d
  const afterDdi = d.slice(2)         // DDD + numero
  const ddd = afterDdi.slice(0, 2)
  const num = afterDdi.slice(2)

  const cands = new Set()
  cands.add(base)

  if (/^\d{2}\d{8,9}$/.test(afterDdi)) {
    if (num.length === 8) {
      // pode ser fixo OU móvel antigo; testa versão com 9 também
      cands.add('55' + ddd + '9' + num)
    } else if (num.length === 9 && num.startsWith('9')) {
      // móvel; testa sem o 9 caso o cadastro antigo exista sem ele
      cands.add('55' + ddd + num.slice(1))
    }
  }

  return Array.from(cands)
}

async function resolveJid(c, raw) {
  const candidates = MontaNumero(raw)
  for (const msisdn of candidates) {
    try {
      const wid = await c.getNumberId(msisdn) // retorna { _serialized: '5511...@c.us' } se existe
      if (wid && wid._serialized) return wid._serialized
    } catch (_) {}
  }
  return null
}

function AguardandoConexao(c, { timeoutMs = 30000 } = {}) {
  if (status === 'ready') return Promise.resolve()
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('WPP não ficou ready a tempo')), timeoutMs)
    c.once('ready', () => { clearTimeout(t); resolve() })
  })
}

async function sendText(to, text) {
  if (!text || !String(text).trim()) throw new Error('texto vazio')
  const c = initClient()
  await AguardandoConexao(c)

  const active = onlyDigits(c.info?.wid?._serialized)
  const expected = onlyDigits(process.env.WPP_SENDER || '')
  if (expected && active && !active.endsWith(expected)) {
    throw new Error(`Conta WPP pareada não confere. Ativo=${active}, Esperado=${expected}`)
  }

  let raw = String(to).trim()
  let jid = null

  if (/@g\.us$/i.test(raw)) {
    jid = raw
  } else {
    const digits = raw.includes('@') ? onlyDigits(raw.split('@')[0]) : onlyDigits(raw)
    if (!digits) throw new Error('destino inválido (sem dígitos)')
    jid = await resolveJid(c, digits)  // usa getNumberId + heurística BR com/sem 9
    if (!jid) throw new Error('Número não encontrado no WhatsApp (confira DDI/DDD e 9º dígito)')
  }

  const msg = await c.sendMessage(jid, text)
  return { id: msg.id.id, to: jid, from: c.info?.wid?._serialized }
}

module.exports = { initClient, getStatus, getLastQr, disconnect, setAutoReconnect, getReconnectState, sendText }
