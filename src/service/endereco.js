const db = require('../configs/pg');

const sql_getById = `
    SELECT e.end_id, e.cli_id, e.cid_id,
           e.cli_bairro, e.cli_logradouro, e.cli_cep, e.cli_numero, e.cli_endereco, e.cli_ativo,
           c.cid_nome, u.uf_nome, u.uf_sigla, cl.cli_nome
      FROM t_endercli e
      JOIN t_cidade c ON e.cid_id = c.cid_id
      JOIN t_uf u ON c.uf_id = u.uf_id
      JOIN t_cliente cl ON e.cli_id = cl.cli_id
     WHERE e.end_id = $1`;

const getEnderecoById = async (id) => {
    try {
        const result = await db.query(sql_getById, [id]);
        if (result.rows.length === 0) {
            throw new Error('Endereço não encontrado');
        }
        return { total: result.rows.length, endereco: result.rows[0] };
    } catch (err) {
        if (err.message === 'Endereço não encontrado') {
            throw { status: 404, message: err.message };
        }
        throw { status: 500, message: 'Erro ao buscar endereço' };
    }
};

const sql_getAll = `
    SELECT e.end_id, e.cli_id, e.cid_id,
           e.cli_bairro, e.cli_logradouro, e.cli_cep, e.cli_numero, e.cli_endereco, e.cli_ativo,
           c.cid_nome, u.uf_nome, u.uf_sigla, cl.cli_nome
      FROM t_endercli e
      JOIN t_cidade c ON e.cid_id = c.cid_id
      JOIN t_uf u ON c.uf_id = u.uf_id
      JOIN t_cliente cl ON e.cli_id = cl.cli_id`;

const getEnderecos = async () => {
    try {
        const result = await db.query(sql_getAll);
        return { total: result.rows.length, enderecos: result.rows };
    } catch (err) {
        throw { status: 500, message: 'Erro ao buscar endereços' };
    }
};

const sql_post = `
    INSERT INTO t_endercli (cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING end_id`;

const postEndereco = async (params) => {
    try {
        const { cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco } = params;

        // Valida se o cliente existe
        const clienteExists = await db.query(`SELECT cli_id FROM t_cliente WHERE cli_id = $1`, [cli_id]);
        if (clienteExists.rows.length === 0) {
            throw { status: 400, message: 'Cliente informado não existe' };
        }

        // Valida se a cidade existe
        const cidadeExists = await db.query(`SELECT cid_id FROM t_cidade WHERE cid_id = $1`, [cid_id]);
        if (cidadeExists.rows.length === 0) {
            throw { status: 400, message: 'Cidade informada não existe' };
        }

        const result = await db.query(sql_post, [cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco]);
        return { mensagem: 'Endereço criado com sucesso!', id: result.rows[0].end_id };
    } catch (err) {
        if (err.status && err.message) throw err;
        throw { status: 500, message: 'Erro ao tentar criar endereço' + err.message };
    }
};

const sql_put = `
    UPDATE t_endercli
       SET cli_id = $2, cid_id = $3, cli_bairro = $4, cli_logradouro = $5,
           cli_cep = $6, cli_numero = $7, cli_endereco = $8, cli_ativo = $9
     WHERE end_id = $1 RETURNING end_id`;

const putEndereco = async (params) => {
    try {
        const { id, cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco, cli_ativo } = params;

        // Valida cliente e cidade
        const clienteExists = await db.query(`SELECT cli_id FROM t_cliente WHERE cli_id = $1`, [cli_id]);
        if (clienteExists.rows.length === 0) {
            throw { status: 400, message: 'Cliente informado não existe' };
        }

        const cidadeExists = await db.query(`SELECT cid_id FROM t_cidade WHERE cid_id = $1`, [cid_id]);
        if (cidadeExists.rows.length === 0) {
            throw { status: 400, message: 'Cidade informada não existe' };
        }

        const result = await db.query(sql_put, [id, cli_id, cid_id, cli_bairro, cli_logradouro, cli_cep, cli_numero, cli_endereco, cli_ativo || 'S']);
        if (result.rows.length === 0) {
            throw new Error('Endereço não encontrado');
        }
        return { mensagem: 'Endereço atualizado com sucesso!' };
    } catch (err) {
        if (err.status && err.message) throw err;
        throw { status: 500, message: err.message };
    }
};

const sql_patch = `UPDATE t_endercli SET`;

const patchEndereco = async (params) => {
    try {
        let fields = '';
        let binds = [params.id];
        let count = 1;

        if (params.cli_id) {
            const clienteExists = await db.query(`SELECT cli_id FROM t_cliente WHERE cli_id = $1`, [params.cli_id]);
            if (clienteExists.rows.length === 0) throw { status: 400, message: 'Cliente informado não existe' };
            if (fields.length > 0) fields += ',';
            count++;
            fields += ` cli_id = $${count}`;
            binds.push(params.cli_id);
        }

        if (params.cid_id) {
            const cidadeExists = await db.query(`SELECT cid_id FROM t_cidade WHERE cid_id = $1`, [params.cid_id]);
            if (cidadeExists.rows.length === 0) throw { status: 400, message: 'Cidade informada não existe' };
            if (fields.length > 0) fields += ',';
            count++;
            fields += ` cid_id = $${count}`;
            binds.push(params.cid_id);
        }

        if (params.cli_bairro) { 
            if (fields.length > 0) 
            fields += ','; 
            count++; 
            fields += ` cli_bairro = $${count}`; 
            binds.push(params.cli_bairro); 
        }
        if (params.cli_logradouro) { 
            if (fields.length > 0) 
            fields += ','; 
            count++; 
            fields += ` cli_logradouro = $${count}`; 
            binds.push(params.cli_logradouro); 
        }
        if (params.cli_cep) { 
            if (fields.length > 0) 
            fields += ','; 
            count++; 
            fields += ` cli_cep = $${count}`; 
            binds.push(params.cli_cep); 
        }
        if (params.cli_numero) { 
            if (fields.length > 0) 
            fields += ','; 
            count++; 
            fields += ` cli_numero = $${count}`;
            binds.push(params.cli_numero); 
        }
        if (params.cli_endereco) { 
            if (fields.length > 0) 
            fields += ','; 
            count++; 
            fields += ` cli_endereco = $${count}`; 
            binds.push(params.cli_endereco); 
        }
        if (params.cli_ativo) { 
            if (fields.length > 0) 
            fields += ','; 
            count++; 
            fields += ` cli_ativo = $${count}`; 
            binds.push(params.cli_ativo); 
        }

        if (!fields) throw { status: 400, message: 'Nenhum campo para atualizar' };

        let sql = sql_patch + fields + ' WHERE end_id = $1 RETURNING end_id';
        const result = await db.query(sql, binds);

        if (result.rows.length === 0) throw new Error('Endereço não encontrado');
        return { mensagem: 'Endereço atualizado com sucesso!' };
    } catch (err) {
        if (err.status && err.message) throw err;
        throw { status: 500, message: err.message };
    }
};

const sql_delete = `
    DELETE FROM t_endercli
     WHERE end_id = $1 RETURNING end_id`;

const deleteEndereco = async (id) => {
    try {
        const result = await db.query(sql_delete, [id]);
        if (result.rows.length === 0) throw new Error('Endereço não encontrado');
        return { mensagem: 'Endereço deletado com sucesso!' };
    } catch (err) {
        throw { status: 500, message: err.message };
    }
};

module.exports = {
    getEnderecoById,
    getEnderecos,
    postEndereco,
    putEndereco,
    patchEndereco,
    deleteEndereco
};
