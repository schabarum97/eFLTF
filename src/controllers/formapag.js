const formaPagService = require('../service/formapag');

const getFormasPag = async (req, res, next) => {
  try {
    const retorno = await formaPagService.getFormasPag();
    res.status(200).json(retorno);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const retorno = await formaPagService.getFormaPagById(id);
    res.status(200).json(retorno);
  } catch (err) {
    if (err.message === 'Forma de Pagamento não encontrada') {
      res.status(404).send(err.message);
    } else {
      res.status(500).send(err.message);
    }
  }
};

const postFormaPag = async (req, res, next) => {
  try {
    const retorno = await formaPagService.postFormaPag(req.body);
    res.status(201).json(retorno);
  } catch (err) {
    res.status(err.status || 500).send(err.message);
  }
};

const putFormaPag = async (req, res, next) => {
  try {
    let params = req.body;
    params.id = req.params.id;
    const retorno = await formaPagService.putFormaPag(params);
    res.status(200).json(retorno);
  } catch (err) {
    if (err.message === 'Forma de Pagamento não encontrada') {
      res.status(404).send(err.message);
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

const patchFormaPag = async (req, res, next) => {
  try {
    let params = req.body;
    params.id = req.params.id;
    const retorno = await formaPagService.patchFormaPag(params);
    res.status(200).json(retorno);
  } catch (err) {
    if (err.message === 'Forma de Pagamento não encontrada') {
      res.status(404).send(err.message);
    } else {
      res.status(err.status || 500).send(err.message);
    }
  }
};

const deleteFormaPag = async (req, res, next) => {
  try {
    const retorno = await formaPagService.deleteFormaPag(req.params.id);
    res.status(204).json(retorno);
  } catch (err) {
    if (err.message === 'Forma de Pagamento não encontrada') {
      res.status(404).send(err.message);
    } else {
      res.status(500).send(err.message);
    }
  }
};

module.exports = {
  getFormasPag,
  getById,
  postFormaPag,
  putFormaPag,
  patchFormaPag,
  deleteFormaPag
};
