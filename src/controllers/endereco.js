const enderecoService = require('../service/endereco');

const getEnderecos = async (req, res, next) => {
    try {
        const retorno = await enderecoService.getEnderecos();
        res.status(200).json(retorno);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const retorno = await enderecoService.getEnderecoById(id);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Endereço não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const postEndereco = async (req, res, next) => {
    try {
        const retorno = await enderecoService.postEndereco(req.body);
        res.status(201).json(retorno);
    } catch (err) {
        res.status(err.status || 500).send(err.message);
    }
};

const putEndereco = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id;
        const retorno = await enderecoService.putEndereco(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Endereço não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(err.status || 500).send(err.message);
        }
    }
};

const patchEndereco = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id;
        const retorno = await enderecoService.patchEndereco(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Endereço não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(err.status || 500).send(err.message);
        }
    }
};

const deleteEndereco = async (req, res, next) => {
    try {
        const retorno = await enderecoService.deleteEndereco(req.params.id);
        res.status(204).json(retorno);
    } catch (err) {
        if (err.message === 'Endereço não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

module.exports = {
    getEnderecos,
    getById,
    postEndereco,
    putEndereco,
    patchEndereco,
    deleteEndereco
};
