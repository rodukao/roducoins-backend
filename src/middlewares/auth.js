const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformado.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Erro ao verificar o token:', err);
      return res.status(401).json({ error: 'Token inválido.' });
    }

    console.log('Token válido. Decoded:', decoded);
    req.userId = decoded.id;
    console.log('req.userId definido como:', req.userId);
    return next();
  });
};