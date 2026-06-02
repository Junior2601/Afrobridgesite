const bcrypt = require('bcrypt');
const AdminModel = require('../models/admin.model');

const SALT_ROUNDS = 10;

/**
 * admin.service.js
 * Logique métier pour la gestion des admins.
 */

// ──Création ───────────────────────────────── ─────────────────────────────────
const createAdmin = async ({ full_name, email, password, phone, country, city, language }) => {
  const existant = await AdminModel.findByEmail(email);
  if (existing.rows.length) throw { status: 409, message: 'Email déjà utilisé.' } ;

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await AdminModel.create({ full_name, email, password_hash, phone, country, city, language });
  renvoyer result.rows[0];
};

// ── Conférence ────────────────────────────────────────────────────────────────
const getAllAdmins = async ({ page = 1, limit = 20 } = {}) => {
  constante décalage = (page - 1) * limite;
  const result = await AdminModel.findAll({ limit, offset });
  renvoyer résultat.lignes ;
};

const getAdminById = async (id) => {
  const résultat = await AdminModel.findById(id);
  if (!result.rows.length) throw { status: 404, message: 'Admin inaccessible.' };
  renvoyer result.rows[0];
};

// ── Mise à jour ─────────────────────────────── ────────────────────────────────
const updateAdmin = async (id, fields) => {
  // Empêche de modifier le rôle ou le mot de passe via cette route
  const { rôle, mot de passe, hachage_mot_de_passe, ...sûr } = champs;
  if (!Object.keys(safe).length) throw { status: 400, message: 'Aucun champ à mettre à jour.' } ;

  const résultat = await AdminModel.updateUser(id, safe);
  if (!result.rows.length) throw { status: 404, message: 'Admin inaccessible.' };
  renvoyer result.rows[0];
};

// ── Activation / désactivation ──────────────────────── ────────────────────────
const désactiverAdmin = async (id) => {
  const résultat = await AdminModel.deactivate(id);
  if (!result.rows.length) throw { status: 404, message: 'Admin inaccessible.' };
  renvoyer result.rows[0];
};

// ── Validation d'entités ─────────────────────────── ───────────────────────────
const validateShop = async (shopId, adminId, { status, rejection_reason }) => {
  const autorisé = ['approuvé', 'rejeté', 'suspendu'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateShop(shopId, adminId, status, rejection_reason);
  if (!result.rows.length) throw { status: 404, message: 'Boutique introuvable.' };
  renvoyer result.rows[0];
};

const validateService = async (serviceId, adminId, { status, rejection_reason }) => {
  const autorisé = ['approuvé', 'rejeté', 'suspendu'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateService(serviceId, adminId, status, rejection_reason);
  if (!result.rows.length) throw { status: 404, message: 'Service introuvable.' };
  renvoyer result.rows[0];
};

const validateAgent = async (agentProfileId, adminId, { status }) => {
  const autorisé = ['approuvé', 'rejeté', 'suspendu'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateAgent(agentProfileId, adminId, status);
  if (!result.rows.length) throw { status: 404, message: 'Profil agent introuvable.' };
  renvoyer result.rows[0];
};

// ── Paiements ──────────────────────────────── ─────────────────────────────────
const confirmPayment = async (paymentId, adminId) => {
  const result = await AdminModel.confirmPayment(paymentId, adminId);
  if (!result.rows.length) throw { status: 404, message: 'Paiement impossible.' };
  renvoyer result.rows[0];
};

// ── Statistiques ─────────────────────────────── ───────────────────────────────
const getGlobalStats = async () => {
  const résultat = await AdminModel.globalStats();
  renvoyer result.rows[0];
};

module.exports = {
  créerAdmin,
  obtenirTousLesAdministrateurs,
  obtenirAdminById,
  updateAdmin,
  désactiverAdmin,
  validerShop,
  validerService,
  validateAgent,
  confirmer le paiement,
  obtenirGlobalStats,
};const bcrypt = require('bcrypt');
const AdminModel = require('../models/admin.model');

const SALT_ROUNDS = 10;

/**
 * admin.service.js
 * Logique métier pour la gestion des admins.
 */

// ──Création ───────────────────────────────── ─────────────────────────────────
const createAdmin = async ({ full_name, email, password, phone, country, city, language }) => {
  const existant = await AdminModel.findByEmail(email);
  if (existing.rows.length) throw { status: 409, message: 'Email déjà utilisé.' } ;

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await AdminModel.create({ full_name, email, password_hash, phone, country, city, language });
  renvoyer result.rows[0];
};

// ── Conférence ────────────────────────────────────────────────────────────────
const getAllAdmins = async ({ page = 1, limit = 20 } = {}) => {
  constante décalage = (page - 1) * limite;
  const result = await AdminModel.findAll({ limit, offset });
  renvoyer résultat.lignes ;
};

const getAdminById = async (id) => {
  const résultat = await AdminModel.findById(id);
  if (!result.rows.length) throw { status: 404, message: 'Admin inaccessible.' };
  renvoyer result.rows[0];
};

// ── Mise à jour ─────────────────────────────── ────────────────────────────────
const updateAdmin = async (id, fields) => {
  // Empêche de modifier le rôle ou le mot de passe via cette route
  const { rôle, mot de passe, hachage_mot_de_passe, ...sûr } = champs;
  if (!Object.keys(safe).length) throw { status: 400, message: 'Aucun champ à mettre à jour.' } ;

  const résultat = await AdminModel.updateUser(id, safe);
  if (!result.rows.length) throw { status: 404, message: 'Admin inaccessible.' };
  renvoyer result.rows[0];
};

// ── Activation / désactivation ──────────────────────── ────────────────────────
const désactiverAdmin = async (id) => {
  const résultat = await AdminModel.deactivate(id);
  if (!result.rows.length) throw { status: 404, message: 'Admin inaccessible.' };
  renvoyer result.rows[0];
};

// ── Validation d'entités ─────────────────────────── ───────────────────────────
const validateShop = async (shopId, adminId, { status, rejection_reason }) => {
  const autorisé = ['approuvé', 'rejeté', 'suspendu'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateShop(shopId, adminId, status, rejection_reason);
  if (!result.rows.length) throw { status: 404, message: 'Boutique introuvable.' };
  renvoyer result.rows[0];
};

const validateService = async (serviceId, adminId, { status, rejection_reason }) => {
  const autorisé = ['approuvé', 'rejeté', 'suspendu'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateService(serviceId, adminId, status, rejection_reason);
  if (!result.rows.length) throw { status: 404, message: 'Service introuvable.' };
  renvoyer result.rows[0];
};

const validateAgent = async (agentProfileId, adminId, { status }) => {
  const autorisé = ['approuvé', 'rejeté', 'suspendu'];
  if (!allowed.includes(status)) throw { status: 400, message: `Statut invalide. Valeurs : ${allowed.join(', ')}` };
  const result = await AdminModel.validateAgent(agentProfileId, adminId, status);
  if (!result.rows.length) throw { status: 404, message: 'Profil agent introuvable.' };
  renvoyer result.rows[0];
};

// ── Paiements ──────────────────────────────── ─────────────────────────────────
const confirmPayment = async (paymentId, adminId) => {
  const result = await AdminModel.confirmPayment(paymentId, adminId);
  if (!result.rows.length) throw { status: 404, message: 'Paiement impossible.' };
  renvoyer result.rows[0];
};

// ── Statistiques ─────────────────────────────── ───────────────────────────────
const getGlobalStats = async () => {
  const résultat = await AdminModel.globalStats();
  renvoyer result.rows[0];
};

module.exports = {
  créerAdmin,
  obtenirTousLesAdministrateurs,
  obtenirAdminById,
  updateAdmin,
  désactiverAdmin,
  validerShop,
  validerService,
  validateAgent,
  confirmer le paiement,
  obtenirGlobalStats,
};