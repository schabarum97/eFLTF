const db = require('../configs/pg');

const baseSelect = `
  SELECT 
    uf_id   AS id,
    uf_nome AS nome,
    uf_sigla AS sigla
  FROM t_uf`;

const sql_getById = `
  ${baseSelect}
  WHERE t_uf.uf_id = $1`;

const sql_getAll = `
  ${baseSelect}
  ORDER BY t_uf.uf_id DESC`;

const sql_post = `
  INSERT INTO t_uf (uf_nome, uf_sigla)
  VALUES ($1, $2)
  RETURNING uf_id AS id`;

const sql_put = `
  UPDATE t_uf
     SET uf_nome = $2,
         uf_sigla = $3
   WHERE uf_id = $1
RETURNING uf_id AS id`;

const sql_delete = `
  DELETE FROM t_uf
   WHERE uf_id = $1
RETURNING uf_id AS id `;


const getUfById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id]);
    if (result.rows.length === 0) {
      throw new Error('NotFound');
    }
    return { total: result.rows.length, item: result.rows[0] };
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'UF não encontrada' };
    }
    throw { status: 500, message: 'Erro ao buscar UF ' + err.message };
  }
};

const getUfs = async () => {
  try {
    const result = await db.query(sql_getAll);
    return { total: result.rows.length, items: result.rows };
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar UFs ' + err.message };
  }
};

const postUf = async (params) => {
  try {
    const { nome, sigla } = params;

    if (!nome || !sigla) {
      throw { status: 400, message: 'Campos obrigatórios: nome, sigla' };
    }

    const result = await db.query(sql_post, [nome, sigla]);
    return { mensagem: 'UF criada com sucesso!', id: result.rows[0].id };
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao tentar criar UF ' + err.message }
  }
};

const putUf = async (params) => {
  try {
    const { id, nome, sigla } = params;

    if (!id || !nome || !sigla) {
      throw { status: 400, message: 'Campos obrigatórios: id, nome, sigla' };
    }

    const result = await db.query(sql_put, [id, nome, sigla]);
    if (result.rows.length === 0) {
      throw new Error('UF não encontrada');
    }
    return { mensagem: 'UF atualizada com sucesso!' };
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: err.message }
  }
};

const patchUf = async (params) => {
  try {
    const { id } = params;
    if (!id) {
      throw { status: 400, message: 'Campo obrigatório: id' };
    }
    const fields = [];
    const binds = [id];
    let idx = 1;

    if (params.nome !== undefined) {
      idx++;
      fields.push(`uf_nome = $${idx}`);
      binds.push(params.nome);
    }

    if (params.sigla !== undefined) {
      idx++;
      fields.push(`uf_sigla = $${idx}`);
      binds.push(params.sigla);
    }

    if (fields.length === 0) {
      throw { status: 400, message: 'Nenhum campo para atualizar' };
    }

    const sql = `
      UPDATE t_uf
         SET ${fields.join(', ')}
       WHERE uf_id = $1
   RETURNING uf_id AS id
    `;

    const result = await db.query(sql, binds);
    if (result.rows.length === 0) {
      throw new Error('UF não encontrada');
    }

    return { mensagem: 'UF atualizada com sucesso!' };
  } catch (err) {
    throw { status: err.status || 500, message: err.message || 'Erro ao atualizar UF' };
  }
};

const deleteUf = async (id) => {
  try {
    const result = await db.query(sql_delete, [id]);
    if (result.rows.length === 0) {
      throw new Error('UF não encontrada');
    }
    return { mensagem: 'UF deletada com sucesso!' };
  } catch (err) {
    // 23503 = foreign_key_violation (caso tenha FK apontando pra UF)
    if (err.code === '23503') {
      throw { status: 409, message: 'UF vinculada a outros registros (violação de chave estrangeira)' };
    }
    throw { status: 500, message: err.message };
  }
};

module.exports = {
  getUfById,
  getUfs,
  postUf,
  putUf,
  patchUf,
  deleteUf
};
