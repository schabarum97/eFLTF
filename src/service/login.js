const db   = require('../configs/pg')
const jwt  = require('jsonwebtoken')
const cript = require('../utils/salt')
const fs   = require('fs')
const path = require('path')

const PRIVATE_KEY = fs.readFileSync(
  path.resolve(__dirname, '../private/private_key.pem')
)

const sql_get = `
  SELECT 
    t_usuario.usu_id,
    t_usuario.usu_email,
    t_usuario.usu_nome,
    t_usuario.usu_hash,
    t_usuario.usu_salt,
    t_usuario.usu_ativo
  FROM t_usuario
  WHERE t_usuario.usu_email = $1
  LIMIT 1
`;

const login = async (params) => {
  const { user, pass } = params

  const result = await db.query(sql_get, [user])
  if (!result.rows.length) {
    throw { status: 401, message: 'Credenciais inválidas' }
  }

  const row = result.rows[0]

  if (row.usu_ativo === false) {
    throw { status: 403, message: 'Usuário inativo' }
  }

  const salt = row.usu_salt
  const hash = row.usu_hash

  if (!salt || !hash) {
    throw { status: 500, message: 'Usuário sem hash/salt cadastrado' }
  }

  const ok = cript.comparePassword(hash, salt, pass)
  if (!ok) {
    throw { status: 401, message: 'Credenciais inválidas' }
  }

  const payload = {
    sub: row.usu_id,
    email: row.usu_email,
    name: row.usu_nome,
  }

  const token = jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '7d',
  })

  return {
    status: 'Logado com sucesso!',
    user: { id: row.usu_id, email: row.usu_email, nome: row.usu_nome },
    token,
  }
}

module.exports.login = login
