const bcrypt = require('bcrypt');
const AgentModel = require('../models/agent.model');

const SALT_ROUNDS = 10;

/**
 * agent.service.js
 * Logique métier pour la gestion des agents immobiliers.
 */

/**
 * Crée l'utilisateur agent + son profil agent en une seule opération.
 * Le profil démarre en statut "pending" (validation admin requise).
 */
const createAgent = async ({ full_name, email, password, phone, country, city, language, profile }) => {
  const existing = await AgentModel.findByEmail(email);
  if (existing.rows.length) throw { status: 409, message: 'Email déjà utilisé.' };

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const userResult = await AgentModel.create({ full_name, email, password_hash, phone, country, city, language });
  const user = userResult.rows[0];

  const profileResult = await AgentModel.createProfile(user.id, profile ?? {});
  return { ...user, profile: profileResult.rows[0] };
};

const getAllAgents = async ({ page = 1, limit = 20 } = {}) => {
  const result = await AgentModel.findAll({ limit, offset: (page - 1) * limit });
  return result.rows;
};

const getAgentById = async (id) => {
  const result = await AgentModel.findById(id);
  if (!result.rows.length) throw { status: 404, message: 'Agent introuvable.' };
  return result.rows[0];
};

const updateAgent = async (id, fields) => {
  const { role, password, password_hash, ...safe } = fields;
  if (!Object.keys(safe).length) throw { status: 400, message: 'Aucun champ à mettre à jour.' };
  const result = await AgentModel.updateUser(id, safe);
  if (!result.rows.length) throw { status: 404, message: 'Agent introuvable.' };
  return result.rows[0];
};

const getAgentProperties = async (id, pagination) => {
  await getAgentById(id);
  const result = await AgentModel.findProperties(id, pagination);
  return result.rows;
};

const getAgentVisits = async (id, pagination) => {
  await getAgentById(id);
  const result = await AgentModel.findVisits(id, pagination);
  return result.rows;
};

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  getAgentProperties,
  getAgentVisits,
};