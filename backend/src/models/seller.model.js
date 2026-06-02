const { requête } = require('../../db');
const base = require('./base.model');

/**
 * vendeur.model.js
 * Opérations DB spécifiques au rôle "seller" (vendeur).
 */

// ── Création utilisateur vendeur ─────────────────────── ───────────────────────
const créer = ({ nom_complet, email, hachage_mot_de_passe, téléphone, pays, ville, langue }) =>
  requête(
    `INSERT INTO users
       (nom_complet, email, hachage_mot_de_passe, téléphone, pays, ville, langue, rôle)
     VALEURS ($1,$2,$3,$4,$5,$6,$7,'vendeur')
     RETOURNANT id, nom_complet, email, téléphone, rôle, est_actif, est_vérifié, créé_à`,
    [full_name, email, password_hash, phone ?? null, country ?? null, city ?? null, language ?? 'fr']
  );

// ── Création de la boutique liée ─────────────────────── ───────────────────────
const createShop = (userId, { name, slug, description, logo_url, banner_url }) =>
  requête(
    `INSERT INTO shops (user_id, name, slug, description, logo_url, banner_url)
     VALEURS (1 $, 2 $, 3 $, 4 $, 5 $, 6 $)
     RETOURNER *`,
    [userId, name, slug, description ?? null, logo_url ?? null, banner_url ?? null]
  );

// ── Conférence ────────────────────────────────────────────────────────────────
const findAll = ({ limit = 20, offset = 0 } = {}) =>
  requête(
    `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.is_verified,
            u.created_at, s.id AS shop_id, s.name AS shop_name, s.status AS shop_status
     DE LA PART des utilisateurs u
     LEFT JOIN shops s ON s.user_id = u.id
     OÙ u.role = 'vendeur'
     ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
    [limite, décalage]
  );

const findById = (id) =>
  requête(
    `SELECT u.id, u.full_name, u.email, u.phone, u.country, u.city, u.language,
            u.avatar_url, u.role, u.is_active, u.is_verified, u.created_at, u.updated_at,
            s.id AS shop_id, s.name AS shop_name, s.slug AS shop_slug,
            s.status AS shop_status, s.commission_rate
     DE LA PART des utilisateurs u
     LEFT JOIN shops s ON s.user_id = u.id
     OÙ u.id = $1 ET u.role = 'vendeur'`,
    [identifiant]
  );

// ── Produits & services de la boutique ──────────────────── ────────────────────
const findProducts = (userId, { limit = 20, offset = 0 } = {}) =>
  requête(
    `SELECT p.id, p.title, p.price, p.stock, p.status, p.rating_avg, p.created_at
     À partir des produits p
     JOIN shops s ON s.id = p.shop_id
     OÙ s.user_id = $1
     ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limite, décalage]
  );

const findServices = (userId, { limit = 20, offset = 0 } = {}) =>
  requête(
    `SELECT sv.id, sv.title, sv.price, sv.status, sv.rating_avg, sv.created_at
     DE services sv
     JOIN shops s ON s.id = sv.shop_id
     OÙ s.user_id = $1
     ORDER BY sv.created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limite, décalage]
  );

// ── Revenus (paiements) ──────────────────────────── ─────────────────────────────
const findPayouts = (userId) =>
  requête(
    `SELECT py.id, py.amount, py.status, py.method, py.reference, py.processed_at
     FROM payouts py
     JOIN shops s ON s.id = py.shop_id
     OÙ s.user_id = $1
     ORDER BY py.created_at DESC`,
    [ID de l'utilisateur]
  );

module.exports = {
  ...base,
  trouverParId,
  trouverTout,
  créer,
  créerBoutique,
  trouver des produits,
  trouverServices,
  trouver les paiements,
};