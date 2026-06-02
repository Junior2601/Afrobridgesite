const { query } = require('../config/db');

// Colonnes "publiques" renvoyées partout (jamais password_hash).
const PUBLIC_FIELDS = `
  id, full_name, email, phone, role, avatar_url,
  country, city, language, is_active, is_verified, created_at
`;

const UserModel = {
  // Récupère un utilisateur par email — AVEC le hash (nécessaire pour le login).
  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  // Récupère un utilisateur par id — SANS le hash (pour /me et le middleware protect).
  async findById(id) {
    const result = await query(
      `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Crée un utilisateur et renvoie ses champs publics.
  async create({ full_name, email, phone, password_hash, role }) {
    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PUBLIC_FIELDS}`,
      [full_name, email, phone || null, password_hash, role]
    );
    return result.rows[0];
  },
};

module.exports = { UserModel };