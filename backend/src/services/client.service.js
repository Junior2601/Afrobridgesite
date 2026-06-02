const bcrypt = require('bcrypt');
const ClientModel = require('../models/client.model');

const SALT_ROUNDS = 10;

/**
 * client.service.js
 * Logique métier pour la gestion des clients.
 */

const createClient = async ({ full_name, email, password, phone, country, city, language }) => {
  const existing = await ClientModel.findByEmail(email);
  if (existing.rows.length) throw { status: 409, message: 'Email déjà utilisé.' };

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await ClientModel.create({ full_name, email, password_hash, phone, country, city, language });
  return result.rows[0];
};

const getAllClients = async ({ page = 1, limit = 20 } = {}) => {
  const result = await ClientModel.findAll({ limit, offset: (page - 1) * limit });
  return result.rows;
};

const getClientById = async (id) => {
  const result = await ClientModel.findById(id);
  if (!result.rows.length) throw { status: 404, message: 'Client introuvable.' };
  return result.rows[0];
};

const updateClient = async (id, fields) => {
  const { role, password, password_hash, ...safe } = fields;
  if (!Object.keys(safe).length) throw { status: 400, message: 'Aucun champ à mettre à jour.' };
  const result = await ClientModel.updateUser(id, safe);
  if (!result.rows.length) throw { status: 404, message: 'Client introuvable.' };
  return result.rows[0];
};

const getClientOrders = async (id, pagination) => {
  await getClientById(id); // vérifie existence
  const result = await ClientModel.findOrders(id, pagination);
  return result.rows;
};

const getClientFavorites = async (id) => {
  await getClientById(id);
  const result = await ClientModel.findFavorites(id);
  return result.rows;
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  getClientOrders,
  getClientFavorites,
};