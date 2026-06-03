const { query } = require('../config/db');
const base = require('./base.model');

/**
 * seller.model.js
 * Opérations DB spécifiques au rôle "seller" (vendeur).
 */

// ── Création utilisateur vendeur ──────────────────────────────────────────────
const create = ({ full_name, email, password_hash, phone, country, city, language }) =>
  query(
    `INSERT INTO users
       (full_name, email, password_hash, phone, country, city, language, role)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'seller')
     RETURNING id, full_name, email, phone, role, is_active, is_verified, created_at`,
    [full_name, email, password_hash, phone ?? null, country ?? null, city ?? null, language ?? 'fr']
  );

// ── Création de la boutique liée ──────────────────────────────────────────────
const createShop = (userId, { name, slug, description, logo_url, banner_url }) =>
  query(
    `INSERT INTO shops (user_id, name, slug, description, logo_url, banner_url)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [userId, name, slug, description ?? null, logo_url ?? null, banner_url ?? null]
  );

// ── Lecture ───────────────────────────────────────────────────────────────────
const findAll = ({ limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.is_verified,
            u.created_at, s.id AS shop_id, s.name AS shop_name, s.status AS shop_status
     FROM users u
     LEFT JOIN shops s ON s.user_id = u.id
     WHERE u.role = 'seller'
     ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

const findById = (id) =>
  query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.country, u.city, u.language,
            u.avatar_url, u.role, u.is_active, u.is_verified, u.created_at, u.updated_at,
            s.id AS shop_id, s.name AS shop_name, s.slug AS shop_slug,
            s.status AS shop_status, s.commission_rate
     FROM users u
     LEFT JOIN shops s ON s.user_id = u.id
     WHERE u.id = $1 AND u.role = 'seller'`,
    [id]
  );

// ── Produits & services de la boutique ────────────────────────────────────────
const findProducts = (userId, { limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT p.id, p.title, p.price, p.stock, p.status, p.rating_avg, p.created_at
     FROM products p
     JOIN shops s ON s.id = p.shop_id
     WHERE s.user_id = $1
     ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

const findServices = (userId, { limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT sv.id, sv.title, sv.price, sv.status, sv.rating_avg, sv.created_at
     FROM services sv
     JOIN shops s ON s.id = sv.shop_id
     WHERE s.user_id = $1
     ORDER BY sv.created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

// ── Revenus (payouts) ─────────────────────────────────────────────────────────
const findPayouts = (userId) =>
  query(
    `SELECT py.id, py.amount, py.status, py.method, py.reference, py.processed_at
     FROM payouts py
     JOIN shops s ON s.id = py.shop_id
     WHERE s.user_id = $1
     ORDER BY py.created_at DESC`,
    [userId]
  );

module.exports = {
  ...base,
  findById,
  findAll,
  create,
  createShop,
  findProducts,
  findServices,
  findPayouts,
};