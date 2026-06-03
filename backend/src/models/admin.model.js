const { query } = require('../config/db');
const base = require('./base.model');

/**
 * admin.model.js
 * Opérations DB spécifiques au rôle "admin".
 */

// ── Création ──────────────────────────────────────────────────────────────────
const create = ({ full_name, email, password_hash, phone, country, city, language }) =>
  query(
    `INSERT INTO users
       (full_name, email, password_hash, phone, country, city, language, role, is_verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'admin',TRUE)
     RETURNING id, full_name, email, phone, role, is_active, is_verified, created_at`,
    [full_name, email, password_hash, phone ?? null, country ?? null, city ?? null, language ?? 'fr']
  );

// ── Lecture ───────────────────────────────────────────────────────────────────
const findAll = ({ limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT id, full_name, email, phone, role, is_active, is_verified, created_at
     FROM users WHERE role = 'admin'
     ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

const findById = (id) =>
  query(
    `SELECT id, full_name, email, phone, country, city, language, avatar_url,
            role, is_active, is_verified, created_at, updated_at
     FROM users WHERE id = $1 AND role = 'admin'`,
    [id]
  );

// ── Validation d'entités par l'admin ─────────────────────────────────────────
const validateShop = (shopId, adminId, status, rejection_reason = null) =>
  query(
    `UPDATE shops
     SET status = $1, rejection_reason = $2, validated_by = $3, validated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [status, rejection_reason, adminId, shopId]
  );

const validateService = (serviceId, adminId, status, rejection_reason = null) =>
  query(
    `UPDATE services
     SET status = $1, rejection_reason = $2, validated_by = $3, validated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [status, rejection_reason, adminId, serviceId]
  );

const validateAgent = (agentProfileId, adminId, status) =>
  query(
    `UPDATE agent_profiles
     SET status = $1, validated_by = $2, validated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [status, adminId, agentProfileId]
  );

// ── Paiements ─────────────────────────────────────────────────────────────────
const confirmPayment = (paymentId, adminId) =>
  query(
    `UPDATE payments
     SET status = 'confirmed', confirmed_by = $1, confirmed_at = NOW()
     WHERE id = $2 RETURNING *`,
    [adminId, paymentId]
  );

// ── Statistiques globales ─────────────────────────────────────────────────────
const globalStats = () =>
  query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'client')  AS total_clients,
      (SELECT COUNT(*) FROM users WHERE role = 'seller')  AS total_sellers,
      (SELECT COUNT(*) FROM users WHERE role = 'agent')   AS total_agents,
      (SELECT COUNT(*) FROM shops  WHERE status = 'approved') AS active_shops,
      (SELECT COUNT(*) FROM orders WHERE status != 'cancelled') AS total_orders,
      (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status = 'confirmed') AS total_revenue
  `);

module.exports = {
  ...base,          // findById (générique) — surchargé ci-dessous
  findById,         // version admin : filtre role = 'admin'
  findAll,
  create,
  validateShop,
  validateService,
  validateAgent,
  confirmPayment,
  globalStats,
};