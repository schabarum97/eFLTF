const db = require('../configs/pg');

const sql_getById = `
    SELECT stt_id, stt_nome, stt_cor
      FROM t_status
     WHERE stt_id = $1`;

const getStatusById = async (id) => {
    try {
        const result = await db.query(sql_getById, [id]);
        if (result.rows.length === 0) {
            throw new Error('NotFound');
        }
        return { total: result.rows.length, status: result.rows[0] };
    } catch (err) {
        if (err.message === 'NotFound') {
            throw { status: 404, message: 'Status não encontrado' };
        }
        throw { status: 500, message: 'Erro ao buscar status' };
    }
};

const sql_getAll = `
    SELECT stt_id, stt_nome, stt_cor
      FROM t_status`;

const getStatus = async () => {
    try {
        const result = await db.query(sql_getAll);
        return { total: result.rows.length, status: result.rows };
    } catch (err) {
        throw { status: 500, message: 'Erro ao buscar status' };
    }
};

const sql_post = `
    INSERT INTO t_status (stt_nome, stt_cor)
    VALUES ($1, $2) RETURNING stt_id`;

const postStatus = async (params) => {
    try {
        const { nome, cor } = params;
        const result = await db.query(sql_post, [nome, cor]);
        return { mensagem: 'Status criado com sucesso!', id: result.rows[0].stt_id };
    } catch (err) {
        throw { status: 500, message: 'Erro ao tentar criar status' };
    }
};

const sql_put = `
    UPDATE t_status
       SET stt_nome = $2,
           stt_cor = $3
     WHERE stt_id = $1 RETURNING stt_id`;

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

const sql_patch = `UPDATE t_status SET`;

const patchStatus = async (params) => {
    try {
        let fields = '';
        let binds = [params.id];
        let count = 1;

        if (params.nome) {
            count++;
            fields += ` stt_nome = $${count}`;
            binds.push(params.nome);
        }

        if (params.cor) {
            if (fields.length > 0) fields += ',';
            count++;
            fields += ` stt_cor = $${count}`;
            binds.push(params.cor);
        }

        if (!fields) {
            throw { status: 400, message: 'Nenhum campo para atualizar' };
        }

        let sql = sql_patch + fields + ' WHERE stt_id = $1 RETURNING stt_id';
        const result = await db.query(sql, binds);

        if (result.rows.length === 0) {
            throw new Error('Status não encontrado');
        }
        return { mensagem: 'Status atualizado com sucesso!' };
    } catch (err) {
        throw { status: 500, message: err.message };
    }
};

const sql_delete = `
    DELETE FROM t_status
     WHERE stt_id = $1 RETURNING stt_id`;

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
