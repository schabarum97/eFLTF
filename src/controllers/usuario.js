const usuarioService = require('../service/usuario');

const getUsuarios = async (req, res, next) => {
  try {
    const retorno = await usuarioService.getUsers();
    res.status(200).json(retorno);
  } catch (err) {
    res.status(err.status || 500).send(err.message);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const retorno = await usuarioService.getUserById(id);
    res.status(200).json(retorno);
  } catch (err) {
    if (err.status === 404 || err.message === 'Usuário não encontrado') {
      res.status(404).send('Usuário não encontrado');
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

const postUsuario = async (req, res, next) => {
  try {
    const { email, nome, senha } = req.body || {};
    if (!email || !nome || !senha) {
      return res.status(400).send('Campos obrigatórios: email, nome, senha');
    }
    const retorno = await usuarioService.postUser({ email, nome, senha });
    res.status(201).json(retorno);
  } catch (err) {
    res.status(err.status || 500).send(err.message);
  }
};

const patchUsuario = async (req, res, next) => {
  try {
    let params = req.body || {};
    params.id = req.params.id;

    // valida presença da senha atual
    if (!params.pass) {
      return res.status(400).send('Campo obrigatório: pass (senha atual)');
    }

    const retorno = await usuarioService.patchUser(params);
    res.status(200).json(retorno);
  } catch (err) {
    if (err.status === 404 || err.message === 'Usuário não encontrado') {
      res.status(404).send('Usuário não encontrado');
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

const deleteUsuario = async (req, res, next) => {
  try {
    const retorno = await usuarioService.deleteUser(req.params.id);
    res.status(204).json(retorno);
  } catch (err) {
    if (err.status === 404 || err.message === 'Usuário não encontrado') {
      res.status(404).send('Usuário não encontrado');
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

module.exports = {
  getUsuarios,
  getById,
  postUsuario,
  patchUsuario,
  deleteUsuario,
};
