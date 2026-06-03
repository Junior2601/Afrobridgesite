const { query } = require('../config/db');
const base = require('./base.model');

/**
 * client.model.js
 * Opérations DB spécifiques au rôle "client".
 */

// ── Création ──────────────────────────────────────────────────────────────────
const create = ({ full_name, email, password_hash, phone, country, city, language }) =>
  query(
    `INSERT INTO users
       (full_name, email, password_hash, phone, country, city, language, role)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'client')
     RETURNING id, full_name, email, phone, role, is_active, is_verified, created_at`,
    [full_name, email, password_hash, phone ?? null, country ?? null, city ?? null, language ?? 'fr']
  );

// ── Lecture ───────────────────────────────────────────────────────────────────
const findAll = ({ limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT id, full_name, email, phone, country, city, is_active, is_verified, created_at
     FROM users WHERE role = 'client'
     ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

const findById = (id) =>
  query(
    `SELECT id, full_name, email, phone, country, city, language, avatar_url,
            role, is_active, is_verified, created_at, updated_at
     FROM users WHERE id = $1 AND role = 'client'`,
    [id]
  );

// ── Commandes du client ───────────────────────────────────────────────────────
const findOrders = (clientId, { limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT o.id, o.status, o.total_amount, o.created_at,
            s.name AS shop_name
     FROM orders o
     JOIN shops s ON s.id = o.shop_id
     WHERE o.client_id = $1
     ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`,
    [clientId, limit, offset]
  );

// ── Favoris du client ─────────────────────────────────────────────────────────
const findFavorites = (clientId) =>
  query(
    `SELECT f.item_type, f.item_id, f.created_at
     FROM favorites f
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [clientId]
  );

module.exports = {
  ...base,
  findById,
  findAll,
  create,
  findOrders,
  findFavorites,
};