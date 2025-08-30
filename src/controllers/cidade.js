const cidadeService = require('../service/cidade');

const getCidades = async (req, res, next) => {
    try {
        const retorno = await cidadeService.getCidades();
        res.status(200).json(retorno);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const retorno = await cidadeService.getCidadeById(id);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Cidade não encontrada') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const postCidade = async (req, res, next) => {
    try {
        const retorno = await cidadeService.postCidade(req.body);
        res.status(201).json(retorno);
    } catch (err) {
        res.status(err.status || 500).send(err.message);
    }
};

const putCidade = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id;
        const retorno = await cidadeService.putCidade(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Cidade não encontrada') {
            res.status(404).send(err.message);
        } else {
            res.status(err.status || 500).send(err.message);
        }
    }
};

const patchCidade = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id;
        const retorno = await cidadeService.patchCidade(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Cidade não encontrada') {
            res.status(404).send(err.message);
        } else {
            res.status(err.status || 500).send(err.message);
        }
    }
};

const deleteCidade = async (req, res, next) => {
    try {
        const retorno = await cidadeService.deleteCidade(req.params.id);
        res.status(204).json(retorno);
    } catch (err) {
        if (err.message === 'Cidade não encontrada') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

module.exports = {
    getCidades,
    getById,
    postCidade,
    putCidade,
    patchCidade,
    deleteCidade
};
