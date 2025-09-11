const utils = require('../utils/salt')

async function check(req, res, next){
    const token = req.cookies.auth;
    if(!token){
        res.status(401).send('Não autorizado realize o login')
    }else{
        const ret = await utils.checkToken(token);
        if(ret){
            return next();
        }else{
            res.status(401).send('Não autorizado realize o login')
        }
    }
}

module.exports.check = check;