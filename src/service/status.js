const db = require('../configs/pg');

const baseSelect = `
  SELECT 
    stt_id   AS id,
    stt_nome AS nome,
    stt_cor  AS cor
  FROM t_status`;

const sql_getById = `
  ${baseSelect}
  WHERE t_status.stt_id = $1`;

const sql_getAll = `
  ${baseSelect}
  ORDER BY t_status.stt_id DESC`;
 

const sql_post = `
    INSERT INTO t_status (stt_nome, stt_cor)
    VALUES ($1, $2)
    RETURNING stt_id AS id`;

const sql_put = `
    UPDATE t_status
       SET stt_nome = $2,
           stt_cor  = $3
     WHERE stt_id = $1
 RETURNING stt_id AS id`;

const sql_delete = `
    DELETE FROM t_status
     WHERE stt_id = $1
 RETURNING stt_id AS id`;

const getStatusById = async (id) => {
  try {
    const result = await db.query(sql_getById, [id]);
    if (result.rows.length === 0) {
      throw new Error('NotFound');
    }
    return { total: result.rows.length, item: result.rows[0] };
  } catch (err) {
    if (err.message === 'NotFound') {
      throw { status: 404, message: 'Status não encontrado' };
    }
    throw { status: 500, message: 'Erro ao buscar Status ' + err.message };
  }
};

const getStatus = async () => {
  try {
    const result = await db.query(sql_getAll);
    return { total: result.rows.length, items: result.rows };
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar Status ' + err.message };
  }
};

const postStatus = async (params) => {
  try {
    const { nome, cor } = params;
    const result = await db.query(sql_post, [nome, cor]);
    return { mensagem: 'Status criado com sucesso!', id: result.rows[0].id };
  } catch (err) {
    throw { status: 500, message: 'Erro ao tentar criar Status ' + err.message };
  }
};

const putStatus = async (params) => {
  try {
    const { id, nome, cor } = params;
    const result = await db.query(sql_put, [id, nome, cor]);
    if (result.rows.length === 0) {
      throw new Error('Status não encontrado');
    }
    return { mensagem: 'Status atualizado com sucesso!' };
  } catch (err) {
    throw { status: 500, message: err.message };
  }
};

const patchStatus = async (params) => {
  try {
    let fields = [];
    let binds = [params.id];
    let count = 1;

    if (params.nome !== undefined) {
      count++;
      fields.push(`stt_nome = $${count}`);
      binds.push(params.nome);
    }

    if (params.cor !== undefined) {
      count++;
      fields.push(`stt_cor = $${count}`);
      binds.push(params.cor);
    }

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    const sql = `
      UPDATE t_status
         SET ${fields.join(', ')}
       WHERE stt_id = $1
   RETURNING stt_id AS id`;

    const result = await db.query(sql, binds);

    if (result.rows.length === 0) {
      throw new Error('Status não encontrado');
    }

    return { mensagem: 'Status atualizado com sucesso!' };
  } catch (err) {
    throw { status: 500, message: err.message };
  }
};

const deleteStatus = async (id) => {
  try {
    const result = await db.query(sql_delete, [id]);
    if (result.rows.length === 0) {
      throw new Error('Status não encontrado');
    }
    return { mensagem: 'Status deletado com sucesso!' };
  } catch (err) {
    throw { status: 500, message: err.message };
  }
};

module.exports = {
  getStatusById,
  getStatus,
  postStatus,
  putStatus,
  patchStatus,
  deleteStatus
};
