const bcrypt = require('bcrypt');
const SellerModel = require('../models/seller.model');

const SALT_ROUNDS = 10;

/**
 * seller.service.js
 * Logique métier pour la gestion des vendeurs.
 */

/**
 * Crée l'utilisateur vendeur + sa boutique en une seule opération.
 * La boutique démarre en statut "pending" (validation admin requise).
 */
const createSeller = async ({ full_name, email, password, phone, country, city, language, shop }) => {
  const existing = await SellerModel.findByEmail(email);
  if (existing.rows.length) throw { status: 409, message: 'Email déjà utilisé.' };

  if (!shop?.name || !shop?.slug) throw { status: 400, message: 'Le nom et le slug de la boutique sont requis.' };

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const userResult = await SellerModel.create({ full_name, email, password_hash, phone, country, city, language });
  const user = userResult.rows[0];

  const shopResult = await SellerModel.createShop(user.id, shop);
  return { ...user, shop: shopResult.rows[0] };
};

const getAllSellers = async ({ page = 1, limit = 20 } = {}) => {
  const result = await SellerModel.findAll({ limit, offset: (page - 1) * limit });
  return result.rows;
};

const getSellerById = async (id) => {
  const result = await SellerModel.findById(id);
  if (!result.rows.length) throw { status: 404, message: 'Vendeur introuvable.' };
  return result.rows[0];
};

const updateSeller = async (id, fields) => {
  const { role, password, password_hash, ...safe } = fields;
  if (!Object.keys(safe).length) throw { status: 400, message: 'Aucun champ à mettre à jour.' };
  const result = await SellerModel.updateUser(id, safe);
  if (!result.rows.length) throw { status: 404, message: 'Vendeur introuvable.' };
  return result.rows[0];
};

const getSellerProducts = async (id, pagination) => {
  await getSellerById(id);
  const result = await SellerModel.findProducts(id, pagination);
  return result.rows;
};

const getSellerServices = async (id, pagination) => {
  await getSellerById(id);
  const result = await SellerModel.findServices(id, pagination);
  return result.rows;
};

const getSellerPayouts = async (id) => {
  await getSellerById(id);
  const result = await SellerModel.findPayouts(id);
  return result.rows;
};

module.exports = {
  createSeller,
  getAllSellers,
  getSellerById,
  updateSeller,
  getSellerProducts,
  getSellerServices,
  getSellerPayouts,
};