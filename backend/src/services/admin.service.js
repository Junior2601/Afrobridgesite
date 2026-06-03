const bcrypt = require('bcrypt');
const AdminModel = require('../models/admin.model');

const SALT_ROUNDS = 10;

/**
 * admin.service.js
 * Logique métier pour la gestion des admins.
 */

// ── Création ──────────────────────────────────────────────────────────────────
const createAdmin = async ({ full_name, email, password, phone, country, city, language }) => {
  const existing = await AdminModel.findByEmail(email);
  if (existing.rows.length) throw { status: 409, message: 'Email déjà utilisé.' };

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await AdminModel.create({ full_name, email, password_hash, phone, country, city, language });
  return result.rows[0];
};

// ── Lecture ───────────────────────────────────────────────────────────────────
const getAllAdmins = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const result = await AdminModel.findAll({ limit, offset });
  return result.rows;
};

const getAdminById = async (id) => {
  const result = await AdminModel.findById(id);
  if (!result.rows.length) throw { status: 404, message: 'Admin introuvable.' };
  return result.rows[0];
};

// ── Mise à jour ───────────────────────────────────────────────────────────────
const updateAdmin = async (id, fields) => {
  // Empêche de modifier le rôle ou le mot de passe via cette route
  const { role, password, password_hash, ...safe } = fields;
  if (!Object.keys(safe).length) throw { status: 400, message: 'Aucun champ à mettre à jour.' };

  const result = await AdminModel.updateUser(id, safe);
  if (!result.rows.length) throw { status: 404, message: 'Admin introuvable.' };
  return result.rows[0];
};

// ── Activation / désactivation ────────────────────────────────────────────────
const deactivateAdmin = async (id) => {
  const result = await AdminModel.deactivate(id);
  if (!result.rows.length) throw { status: 404, message: 'Admin introuvable.' };
  return result.rows[0];
};

// ── Validation d'entités ──────────────────────────────────────────────────────
const validateShop = async (shopId, adminId, { status, rejection_reason }) => {
  const allowed = ['approved', 'rejected', 'suspended'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateShop(shopId, adminId, status, rejection_reason);
  if (!result.rows.length) throw { status: 404, message: 'Boutique introuvable.' };
  return result.rows[0];
};

const validateService = async (serviceId, adminId, { status, rejection_reason }) => {
  const allowed = ['approved', 'rejected', 'suspended'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateService(serviceId, adminId, status, rejection_reason);
  if (!result.rows.length) throw { status: 404, message: 'Service introuvable.' };
  return result.rows[0];
};

const validateAgent = async (agentProfileId, adminId, { status }) => {
  const allowed = ['approved', 'rejected', 'suspended'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateAgent(agentProfileId, adminId, status);
  if (!result.rows.length) throw { status: 404, message: 'Profil agent introuvable.' };
  return result.rows[0];
};

// ── Paiements ─────────────────────────────────────────────────────────────────
const confirmPayment = async (paymentId, adminId) => {
  const result = await AdminModel.confirmPayment(paymentId, adminId);
  if (!result.rows.length) throw { status: 404, message: 'Paiement introuvable.' };
  return result.rows[0];
};

// ── Statistiques ──────────────────────────────────────────────────────────────
const getGlobalStats = async () => {
  const result = await AdminModel.globalStats();
  return result.rows[0];
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deactivateAdmin,
  validateShop,
  validateService,
  validateAgent,
  confirmPayment,
  getGlobalStats,
};