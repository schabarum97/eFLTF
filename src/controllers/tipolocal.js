const tipolocalService = require('../service/tipolocal');

const getTiposLocal = async (req, res, next) => {
  try {
    const retorno = await tipolocalService.getTiposLocal();
    res.status(200).json(retorno);
  } catch (err) {
    res.status(err.status || 500).send(err.message);
  }
};

const getAtivos = async (req, res, next) => {
  try {
    const retorno = await tipolocalService.getTiposLocalAtivos();
    res.status(200).json(retorno);
  } catch (err) {
    res.status(err.status || 500).send(err.message);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const retorno = await tipolocalService.getTipoLocalById(id);
    res.status(200).json(retorno);
  } catch (err) {
    if (err.status === 404 || err.message === 'Tipo de local não encontrado') {
      res.status(404).send(err.message);
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

const postTipoLocal = async (req, res, next) => {
  try {
    const retorno = await tipolocalService.postTipoLocal(req.body);
    res.status(201).json(retorno);
  } catch (err) {
    if (err.status === 409) {
      res.status(409).send(err.message);
    } else if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(500).send(err.message);
    }
  }
};

const putTipoLocal = async (req, res, next) => {
  try {
    const params = { ...req.body, id: req.params.id };
    const retorno = await tipolocalService.putTipoLocal(params);
    res.status(200).json(retorno);
  } catch (err) {
    if (err.status === 404 || err.message === 'Tipo de local não encontrado') {
      res.status(404).send(err.message);
    } else if (err.status === 409) {
      res.status(409).send(err.message);
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

const patchTipoLocal = async (req, res, next) => {
  try {
    const params = { ...req.body, id: req.params.id };
    const retorno = await tipolocalService.patchTipoLocal(params);
    res.status(200).json(retorno);
  } catch (err) {
    if (err.status === 404 || err.message === 'Tipo de local não encontrado') {
      res.status(404).send(err.message);
    } else if (err.status === 409) {
      res.status(409).send(err.message);
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

const deleteTipoLocal = async (req, res, next) => {
  try {
    const retorno = await tipolocalService.deleteTipoLocal(req.params.id);
    res.status(204).json(retorno);
  } catch (err) {
    if (err.status === 404 || err.message === 'Tipo de local não encontrado') {
      res.status(404).send(err.message);
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

module.exports = {
  getTiposLocal,
  getAtivos,
  getById,
  postTipoLocal,
  putTipoLocal,
  patchTipoLocal,
  deleteTipoLocal
};