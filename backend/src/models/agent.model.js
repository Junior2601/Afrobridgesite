const { query } = require('../config/db');
const base = require('./base.model');

/**
 * agent.model.js
 * Opérations DB spécifiques au rôle "agent" (agent immobilier).
 */

// ── Création utilisateur agent ────────────────────────────────────────────────
const create = ({ full_name, email, password_hash, phone, country, city, language }) =>
  query(
    `INSERT INTO users
       (full_name, email, password_hash, phone, country, city, language, role)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'agent')
     RETURNING id, full_name, email, phone, role, is_active, is_verified, created_at`,
    [full_name, email, password_hash, phone ?? null, country ?? null, city ?? null, language ?? 'fr']
  );

// ── Création du profil agent lié ──────────────────────────────────────────────
const createProfile = (userId, { agency_name, license_number, bio }) =>
  query(
    `INSERT INTO agent_profiles (user_id, agency_name, license_number, bio)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [userId, agency_name ?? null, license_number ?? null, bio ?? null]
  );

// ── Lecture ───────────────────────────────────────────────────────────────────
const findAll = ({ limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.is_verified,
            u.created_at, ap.agency_name, ap.license_number, ap.status AS profile_status
     FROM users u
     LEFT JOIN agent_profiles ap ON ap.user_id = u.id
     WHERE u.role = 'agent'
     ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

const findById = (id) =>
  query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.country, u.city, u.language,
            u.avatar_url, u.role, u.is_active, u.is_verified, u.created_at, u.updated_at,
            ap.id AS profile_id, ap.agency_name, ap.license_number, ap.bio,
            ap.status AS profile_status
     FROM users u
     LEFT JOIN agent_profiles ap ON ap.user_id = u.id
     WHERE u.id = $1 AND u.role = 'agent'`,
    [id]
  );

// ── Biens immobiliers de l'agent ──────────────────────────────────────────────
const findProperties = (userId, { limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT p.id, p.title, p.transaction_type, p.property_type, p.price,
            p.city, p.status, p.created_at
     FROM properties p
     WHERE p.agent_id = $1
     ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

// ── Visites planifiées ────────────────────────────────────────────────────────
const findVisits = (userId, { limit = 20, offset = 0 } = {}) =>
  query(
    `SELECT pv.id, pv.visit_date, pv.status, pv.notes,
            prop.title AS property_title,
            u.full_name AS client_name
     FROM property_visits pv
     JOIN properties prop ON prop.id = pv.property_id
     JOIN users u ON u.id = pv.client_id
     WHERE prop.agent_id = $1
     ORDER BY pv.visit_date DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

module.exports = {
  ...base,
  findById,
  findAll,
  create,
  createProfile,
  findProperties,
  findVisits,
};