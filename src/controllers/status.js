const statusService = require('../service/status');

const getStatus = async (req, res, next) => {
    try {
        const retorno = await statusService.getStatus();
        res.status(200).json(retorno);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const retorno = await statusService.getStatusById(id);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Status não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const postStatus = async (req, res, next) => {
    try {
        const retorno = await statusService.postStatus(req.body);
        res.status(201).json(retorno);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const putStatus = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id;
        const retorno = await statusService.putStatus(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Status não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const patchStatus = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id;
        const retorno = await statusService.patchStatus(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Status não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const deleteStatus = async (req, res, next) => {
    try {
        const retorno = await statusService.deleteStatus(req.params.id);
        res.status(204).json(retorno);
    } catch (err) {
        if (err.message === 'Status não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

module.exports = {
    getStatus,
    getById,
    postStatus,
    putStatus,
    patchStatus,
    deleteStatus
};
