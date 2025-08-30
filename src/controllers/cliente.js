const clienteService = require('../service/cliente');

const getClientes = async (req, res, next) => {
    try {
        const retorno = await clienteService.getClientes();
        res.status(200).json(retorno);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const retorno = await clienteService.getClienteById(id);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Cliente não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const postCliente = async (req, res, next) => {
    try {
        const retorno = await clienteService.postCliente(req.body);
        res.status(201).json(retorno);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const putCliente = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id; 
        const retorno = await clienteService.putCliente(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Cliente não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

const patchCliente = async (req, res, next) => {
    try {
        let params = req.body;
        params.id = req.params.id; 
        const retorno = await clienteService.patchCliente(params);
        res.status(200).json(retorno);
    } catch (err) {
        if (err.message === 'Cliente não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};


const deleteCliente = async (req, res, next) => {
    try {
        const retorno = await clienteService.deleteCliente(req.params.id);
        res.status(204).json(retorno);
    } catch (err) {
        if (err.message === 'Cliente não encontrado') {
            res.status(404).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
};

module.exports = {
    getClientes,
    getById,
    postCliente,
    putCliente,
    patchCliente,
    deleteCliente
};
