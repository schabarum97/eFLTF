const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const fs = require('fs')

function criarUsuario (senha){
    const salt = generateSalt()
    const hashedPassword = hashPassword(senha, salt)
    return {salt, hashedPassword}
}

function generateSalt(){
    return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt){
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function comparePassword(storedPassword, salt, providedPassword) {
    const hash = hashPassword(providedPassword, salt)
    return hash === storedPassword
}

function checkToken(token){
    const privateKey = fs.readFileSync("./src/private/private_key.pem");
    const decoded = jwt.verify(token, privateKey, {algorithm: 'RS256'})
    return decoded;
}

module.exports.criarUsuario = criarUsuario;
module.exports.comparePassword = comparePassword;
module.exports.hashPassword = hashPassword;
module.exports.checkToken = checkToken;