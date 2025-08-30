const db = require('../configs/pg');

const sql_getById = `
    SELECT uf_id, uf_nome, uf_sigla
      FROM t_uf
     WHERE uf_id = $1`;

const getUfById = async (id) => {
    try {
        const result = await db.query(sql_getById, [id]);
        if (result.rows.length === 0) {
            throw new Error('NotFound');
        }
        return { total: result.rows.length, uf: result.rows[0] };
    } catch (err) {
        if (err.message === 'NotFound') {
            throw { status: 404, message: 'UF não encontrada' };
        }
        throw { status: 500, message: 'Erro ao buscar UF ' + err.message };
    }
};

const sql_getAll = `
    SELECT uf_id, uf_nome, uf_sigla
      FROM t_uf`;

const getUfs = async () => {
    try {
        const result = await db.query(sql_getAll);
        return { total: result.rows.length, ufs: result.rows };
    } catch (err) {
        throw { status: 500, message: 'Erro ao buscar UFs ' + err.message };
    }
};

const sql_post = `
    INSERT INTO t_uf (uf_nome, uf_sigla)
    VALUES ($1, $2) RETURNING uf_id`;

const postUf = async (params) => {
    try {
        const { nome, sigla } = params;
        const result = await db.query(sql_post, [nome, sigla]);
        return { mensagem: 'UF criada com sucesso!', id: result.rows[0].uf_id };
    } catch (err) {
        throw { status: 500, message: 'Erro ao tentar criar UF ' + err.message };
    }
};

const sql_put = `
    UPDATE t_uf
       SET uf_nome = $2, 
           uf_sigla = $3
     WHERE uf_id = $1 RETURNING uf_id`;

const putUf = async (params) => {
    try {
        const { id, nome, sigla } = params;
        const result = await db.query(sql_put, [id, nome, sigla]);
        if (result.rows.length === 0) {
            throw new Error('UF não encontrada');
        }
        return { mensagem: 'UF atualizada com sucesso!' };
    } catch (err) {
        throw { status: 500, message: err.message };
    }
};

const sql_patch = `UPDATE t_uf SET`;

const patchUf = async (params) => {
    try {
        let fields = '';
        let binds = [params.id];
        let count = 1;

        if (params.nome) {
            count++;
            fields += ` uf_nome = $${count}`;
            binds.push(params.nome);
        }

        if (params.sigla) {
            count++;
            fields += ` uf_sigla = $${count}`;
            binds.push(params.sigla);
        }

        let sql = sql_patch + fields + ' WHERE uf_id = $1 RETURNING uf_id';
        const result = await db.query(sql, binds);

        if (result.rows.length === 0) {
            throw new Error('UF não encontrada');
        }
        return { mensagem: 'UF atualizada com sucesso!' };
    } catch (err) {
        throw { status: 500, message: err.message };
    }
};

const sql_delete = `
    DELETE FROM t_uf
     WHERE uf_id = $1 RETURNING uf_id`;

const deleteUf = async (id) => {
    try {
        const result = await db.query(sql_delete, [id]);
        if (result.rows.length === 0) {
            throw new Error('UF não encontrada');
        }
        return { mensagem: 'UF deletada com sucesso!' };
    } catch (err) {
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
