const ufService = require('../service/uf');

const getUfs = async (req, res, next) => {
    try {
        const retorno = await ufService.getUfs();
        res.status(200).json(retorno);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const retorno = await ufService.getUfById(id);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'UF não encontrada') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const postUf = async (req, res, next) => {
    try {
        const retorno = await ufService.postUf(req.body);
        res.status(201).json(retorno);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const putUf = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id;
        const retorno = await ufService.putUf(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'UF não encontrada') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const patchUf = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id;
        const retorno = await ufService.patchUf(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'UF não encontrada') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const deleteUf = async (req, res, next) => {
    try {
        const retorno = await ufService.deleteUf(req.params.id);
        res.status(204).json(retorno);
    } catch (err) {
        if (err.message === 'UF não encontrada') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

module.exports = {
    getUfs,
    getById,
    postUf,
    putUf,
    patchUf,
    deleteUf
};
