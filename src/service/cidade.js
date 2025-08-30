const db = require('../configs/pg');

const sql_getById = `
    SELECT c.cid_id, c.cid_nome, c.uf_id,
           u.uf_nome, u.uf_sigla
      FROM t_cidade c
      JOIN t_uf u ON c.uf_id = u.uf_id
     WHERE c.cid_id = $1`;

const getCidadeById = async (id) => {
    try {
        const result = await db.query(sql_getById, [id]);
        if (result.rows.length === 0) {
            throw new Error('NotFound');
        }
        return { total: result.rows.length, cidade: result.rows[0] };
    } catch (err) {
        if (err.message === 'NotFound') {
            throw { status: 404, message: 'Cidade não encontrada' };
        }
        throw { status: 500, message: 'Erro ao buscar cidade' };
    }
};

const sql_getAll = `
    SELECT c.cid_id, c.cid_nome, c.uf_id,
           u.uf_nome, u.uf_sigla
      FROM t_cidade c
      JOIN t_uf u ON c.uf_id = u.uf_id`;

const getCidades = async () => {
    try {
        const result = await db.query(sql_getAll);
        return { total: result.rows.length, cidades: result.rows };
    } catch (err) {
        throw { status: 500, message: 'Erro ao buscar cidades' };
    }
};

const sql_post = `
    INSERT INTO t_cidade (cid_nome, uf_id)
    VALUES ($1, $2) RETURNING cid_id`;

const postCidade = async (params) => {
    try {
        const { nome, uf_id } = params;

        // Validação se a UF existe
        const ufExists = await db.query(`SELECT uf_id FROM t_uf WHERE uf_id = $1`, [uf_id]);
        if (ufExists.rows.length === 0) {
            throw { status: 400, message: 'UF informada não existe' };
        }

        const result = await db.query(sql_post, [nome, uf_id]);
        return { mensagem: 'Cidade criada com sucesso!', id: result.rows[0].cid_id };
    } catch (err) {
        if (err.status && err.message) throw err;
        throw { status: 500, message: 'Erro ao tentar criar cidade' };
    }
};

const sql_put = `
    UPDATE t_cidade
       SET cid_nome = $2, uf_id = $3
     WHERE cid_id = $1 RETURNING cid_id`;

const putCidade = async (params) => {
    try {
        const { id, nome, uf_id } = params;

        // Validação se a UF existe
        const ufExists = await db.query(`SELECT uf_id FROM t_uf WHERE uf_id = $1`, [uf_id]);
        if (ufExists.rows.length === 0) {
            throw { status: 400, message: 'UF informada não existe' };
        }

        const result = await db.query(sql_put, [id, nome, uf_id]);
        if (result.rows.length === 0) {
            throw new Error('Cidade não encontrada');
        }
        return { mensagem: 'Cidade atualizada com sucesso!' };
    } catch (err) {
        if (err.status && err.message) throw err;
        throw { status: 500, message: err.message };
    }
};

const sql_patch = `UPDATE t_cidade SET`;

const patchCidade = async (params) => {
    try {
        let fields = '';
        let binds = [params.id];
        let count = 1;

        if (params.nome) {
            count++;
            fields += ` cid_nome = $${count}`;
            binds.push(params.nome);
        }

        if (params.uf_id) {
            // Validação se a UF existe
            const ufExists = await db.query(`SELECT uf_id FROM t_uf WHERE uf_id = $1`, [params.uf_id]);
            if (ufExists.rows.length === 0) {
                throw { status: 400, message: 'UF informada não existe' };
            }

            if (fields.length > 0) fields += ',';
            count++;
            fields += ` uf_id = $${count}`;
            binds.push(params.uf_id);
        }

        if (!fields) {
            throw { status: 400, message: 'Nenhum campo para atualizar' };
        }

        let sql = sql_patch + fields + ' WHERE cid_id = $1 RETURNING cid_id';
        const result = await db.query(sql, binds);

        if (result.rows.length === 0) {
            throw new Error('Cidade não encontrada');
        }
        return { mensagem: 'Cidade atualizada com sucesso!' };
    } catch (err) {
        if (err.status && err.message) throw err;
        throw { status: 500, message: err.message };
    }
};

const sql_delete = `
    DELETE FROM t_cidade
     WHERE cid_id = $1 RETURNING cid_id`;

const deleteCidade = async (id) => {
    try {
        const result = await db.query(sql_delete, [id]);
        if (result.rows.length === 0) {
            throw new Error('Cidade não encontrada');
        }
        return { mensagem: 'Cidade deletada com sucesso!' };
    } catch (err) {
        throw { status: 500, message: err.message };
    }
};

module.exports = {
    getCidadeById,
    getCidades,
    postCidade,
    putCidade,
    patchCidade,
    deleteCidade
};
