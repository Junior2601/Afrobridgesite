const jwt = require('jsonwebtoken');

// Génère un token signé à partir d'un payload (ex: { id, role }).
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Vérifie un token et renvoie le payload décodé (lève une erreur si invalide/expiré).
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { signToken, verifyToken };