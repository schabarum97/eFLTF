const { Pool } = require('pg')

const pool = new Pool({
  user: 'admin',
  host: 'tcc-db',   // tem que ser o nome do serviço do docker-compose
  database: 'efltf',
  password: 'admin',
  port: 5432
})

module.exports = { query: (text, params) => pool.query(text, params) }
