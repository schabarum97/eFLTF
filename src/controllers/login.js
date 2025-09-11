const loginService = require('../service/login');
const jwt = require('jsonwebtoken')
const { SECRET } = require('../middleware/auth.js')


const login = async (req, res) => {
  const auth = req.headers.authorization || '';

  if (!/^Basic\s+/i.test(auth)) {
    return res.status(400).json({ type: 'ERRO', message: 'LOGIN WITH BASIC AUTH!' });
  }

  const basicToken = auth.split(' ')[1];
  if (!basicToken) {
    return res.status(400).json({ type: 'ERRO', message: 'Token Basic não fornecido' });
  }

  let user, pass;
  try {
    const decoded = Buffer.from(basicToken, 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    if (idx === -1) {
      return res.status(400).json({ type: 'ERRO', message: 'Header Basic inválido (sem :)' });
    }
    user = decoded.slice(0, idx);
    pass = decoded.slice(idx + 1);
  } catch (e) {
    return res.status(400).json({ type: 'ERRO', message: 'Token Basic malformado' });
  }

  try {
    const ret = await loginService.login({ user, pass });

    res.cookie('auth', ret.token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ status: ret.status, usuario: ret.user, token: ret.token });
  } catch (err) {
    const status = err.status || 401;
    const message = err.message || 'Credenciais inválidas';
    return res.status(status).json({ type: 'ERRO', message });
  }
};

const logout = async =(req, res) =>{
  res.clearCookie('auth', { path: '/', sameSite: 'lax', secure: false })
  return res.sendStatus(204)
};

const me = async =(req, res)  => {
  return res.json({ id: req.user.sub, email: req.user.email })
}

module.exports.login = login;
module.exports.logout = logout;
module.exports.me = me;
