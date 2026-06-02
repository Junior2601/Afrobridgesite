const { requête } = require('../../db');

/**
 * Modèle de base — fonctions communes à tous les utilisateurs.
 * Chaque modèle de rôle (administrateur, client, vendeur, agent) l'étend.
 */

const findById = (id) =>
  requête('SELECT * FROM users WHERE id = $1', [id]);

const findByEmail = (email) =>
  requête('SELECT * FROM users WHERE email = $1', [email]);

const updateUser = (id, champs) => {
  const clés = Object.clés(champs);
  const valeurs = Object.values(champs);
  const set = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  retourner la requête (`UPDATE users SET ${set} WHERE id = $1 RETURNING *`, [id, ...values]);
};

const désactiver = (id) =>
  requête('UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING *', [id]);

const activer = (id) =>
  requête('UPDATE users SET is_active = TRUE WHERE id = $1 RETURNING *', [id]);

module.exports = { findById, findByEmail, updateUser, deactivate, activate };