const { initClient, getStatus, getLastQr, disconnect, setAutoReconnect, getReconnectState } = require('../wpp')

let listeners = new Set()

function broadcast(type, payload) {
  const msg = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`
  for (const res of listeners) res.write(msg)
}

function start() {
  initClient(broadcast)
  return { ok: true }
}

function events(req, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  // estado inicial
  const base = { status: getStatus(), reconnect: getReconnectState() }
  res.write(`event: status\ndata: ${JSON.stringify(base)}\n\n`)
  const qr = getLastQr()
  if (qr) res.write(`event: qr\ndata: ${JSON.stringify({ qr })}\n\n`)

  listeners.add(res)
  req.on('close', () => listeners.delete(res))
}

function status() {
  return { status: getStatus(), reconnect: getReconnectState() }
}

async function apiDisconnect(req, res) {
  const hard = String(req.query.hard || req.body?.hard || '') === 'true'
  await disconnect({ hardReset: hard })
  res.json({ ok: true, hardReset: hard })
}

function apiReconnectToggle(req, res) {
  const enabled = String(req.query.enabled || req.body?.enabled || 'true') === 'true'
  setAutoReconnect(enabled)
  res.json({ ok: true, enabled })
}

module.exports = { start, events, status, apiDisconnect, apiReconnectToggle }
