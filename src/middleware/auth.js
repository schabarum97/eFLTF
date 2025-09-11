const jwt = require('jsonwebtoken')
const fs   = require('fs')
const path = require('path')

const SECRET = fs.readFileSync(
  path.resolve(__dirname, '../private/private_key.pem'))

function authRequired(req, res, next) {
  const token = req.cookies?.auth
  if (!token) return res.sendStatus(401) 

  try {
    const payload = jwt.verify(token, SECRET)
    req.user = payload
    return next()
  } catch {
    return res.sendStatus(401)
  }
}

module.exports = { authRequired, SECRET }
