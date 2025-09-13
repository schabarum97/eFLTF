const wppService = require('../service/wpp')

async function start(req, res) { res.json(wppService.start()) }
async function events(req, res) { wppService.events(req, res) }
async function status(req, res) { res.json(wppService.status()) }
async function disconnect(req, res) { await wppService.apiDisconnect(req, res) }
async function reconnectToggle(req, res) { wppService.apiReconnectToggle(req, res) }

module.exports = { start, events, status, disconnect, reconnectToggle }
