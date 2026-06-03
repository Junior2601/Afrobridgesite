const { query } = require('../config/db');

/**
 * Modèle de base — fonctions communes à tous les utilisateurs.
 * Chaque modèle de rôle (admin, client, seller, agent) l'étend.
 */

const findById = (id) =>
  query('SELECT * FROM users WHERE id = $1', [id]);

const findByEmail = (email) =>
  query('SELECT * FROM users WHERE email = $1', [email]);

const updateUser = (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const set = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  return query(`UPDATE users SET ${set} WHERE id = $1 RETURNING *`, [id, ...values]);
};

const deactivate = (id) =>
  query('UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING *', [id]);

const activate = (id) =>
  query('UPDATE users SET is_active = TRUE WHERE id = $1 RETURNING *', [id]);

module.exports = { findById, findByEmail, updateUser, deactivate, activate };