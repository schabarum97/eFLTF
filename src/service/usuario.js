const db = require("../configs/pg");
const cript = require("../utils/salt");

const baseSelectPublic = `
  SELECT
    usu_id,
    usu_email,
    usu_nome,
    usu_ativo,
    usu_criacao,
    usu_alteracao
  FROM t_usuario
`;

const baseSelectAuth = `
  SELECT
    usu_id,
    usu_email,
    usu_nome,
    usu_ativo,
    usu_criacao,
    usu_alteracao,
    usu_hash,
    usu_salt
  FROM t_usuario
`;

const sql_getById       = `${baseSelectPublic} WHERE t_usuario.usu_id = $1`;
const sql_getAuthById   = `${baseSelectAuth}   WHERE t_usuario.usu_id = $1`;

const sql_getAll = `
  ${baseSelectPublic}
  ORDER BY t_usuario.usu_id
`;

const sql_post = `
  INSERT INTO t_usuario (usu_email, usu_nome, usu_salt, usu_hash)
  VALUES ($1, $2, $3, $4)
  RETURNING usu_id AS id
`;

const sql_delete = `
  DELETE FROM t_usuario
  WHERE usu_id = $1
  RETURNING usu_id AS id
`;

const sql_patch = `UPDATE t_usuario SET`;

async function getUserById(id) {
  try {
    const result = await db.query(sql_getById, [id]);
    if (result.rows.length === 0) throw new Error("NotFound");
    return { total: result.rows.length, item: result.rows[0] };
  } catch (err) {
    if (err.message === "NotFound") {
      throw { status: 404, message: "Usuário não encontrado" };
    }
    throw { status: 500, message: "Erro ao buscar Usuário " + err.message };
  }
}

async function getUserAuthById(id) {
  const result = await db.query(sql_getAuthById, [id]);
  if (result.rows.length === 0) throw { status: 404, message: "Usuário não encontrado" };
  return { total: result.rows.length, item: result.rows[0] };
}

async function getUsers() {
  try {
    const result = await db.query(sql_getAll);
    return { total: result.rows.length, items: result.rows };
  } catch (err) {
    throw { status: 500, message: "Erro ao buscar Usuários " + err.message };
  }
}

async function postUser(params) {
  try {
    const email = String(params.email ?? "").trim().toLowerCase();
    const nome  = String(params.nome  ?? "").trim();
    const senha = String(params.senha ?? "");

    if (!email || !nome || !senha) {
      throw new Error("Campos obrigatórios: email, nome, senha");
    }

    const { salt, hashedPassword } = cript.criarUsuario(senha);
    const result = await db.query(sql_post, [email, nome, salt, hashedPassword]);

    return { mensagem: "Usuário criado com sucesso!", id: result.rows[0].id };
  } catch (err) {
    throw { status: 500, message: "Erro ao tentar criar Usuário " + err.message };
  }
}

async function patchUser(params) {
  const { id, name, pass, newpass } = params;

  if (!id)   throw { status: 400, message: "id é obrigatório" };
  if (!pass) throw { status: 400, message: "Senha atual (pass) é obrigatória" };

  // Traz hash/salt corretamente
  const userData = await getUserAuthById(id);

  const isValid = cript.comparePassword(
    userData.item.usu_hash,
    userData.item.usu_salt,
    pass
  );

  if (!isValid) {
    return { mensagem: "Senha inválida" };
  }

  const sets = [];
  const binds = [id];
  let idx = 2;

  if (newpass) {
    const { salt, hashedPassword } = cript.criarUsuario(newpass);
    sets.push(`usu_hash = $${idx++}`);
    sets.push(`usu_salt = $${idx++}`);
    binds.push(hashedPassword, salt);
  }

  if (name) {
    sets.push(`usu_nome = $${idx++}`);
    binds.push(name);
  }

  if (sets.length === 0) {
    return { mensagem: "Nada para atualizar" };
  }

  const sql = `${sql_patch} ${sets.join(", ")} WHERE usu_id = $1`;
  const result = await db.query(sql, binds);

  if (result.rowCount === 0) {
    throw { status: 404, message: "Usuário não encontrado" };
  }

  return { mensagem: "Dados atualizados com sucesso!" };
}

async function deleteUser(id) {
  try {
    const result = await db.query(sql_delete, [id]);
    if (result.rowCount === 0) {
      throw new Error("Usuário não encontrado");
    }
    return { mensagem: "Usuário deletado com sucesso!" };
  } catch (err) {
    throw { status: 500, message: err.message };
  }
}

module.exports = {
  postUser,
  getUsers,
  getUserById,
  deleteUser,
  patchUser,
};
