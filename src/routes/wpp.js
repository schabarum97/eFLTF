const wppController = require('../controllers/wpp')

module.exports = (app) => {
  app.post('/start', wppController.start)
  app.get('/events', wppController.events)
  app.get('/status', wppController.status)
  app.post('/disconnect', wppController.disconnect) 
  app.post('/reconnect', wppController.reconnectToggle)
}
