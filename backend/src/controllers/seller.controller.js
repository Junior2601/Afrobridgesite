const SellerService = require('../services/seller.service');

const respond = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail    = (res, err) => res.status(err.status ?? 500).json({ success: false, message: err.message ?? 'Erreur serveur.' });

// POST /sellers
const createSeller = async (req, res) => {
  try {
    const seller = await SellerService.createSeller(req.body);
    respond(res, seller, 201);
  } catch (err) { fail(res, err); }
};

// GET /sellers
const getAllSellers = async (req, res) => {
  try {
    const sellers = await SellerService.getAllSellers({ page: +req.query.page || 1, limit: +req.query.limit || 20 });
    respond(res, sellers);
  } catch (err) { fail(res, err); }
};

// GET /sellers/:id
const getSellerById = async (req, res) => {
  try {
    const seller = await SellerService.getSellerById(+req.params.id);
    respond(res, seller);
  } catch (err) { fail(res, err); }
};

// PATCH /sellers/:id
const updateSeller = async (req, res) => {
  try {
    const seller = await SellerService.updateSeller(+req.params.id, req.body);
    respond(res, seller);
  } catch (err) { fail(res, err); }
};

// GET /sellers/:id/products
const getSellerProducts = async (req, res) => {
  try {
    const products = await SellerService.getSellerProducts(+req.params.id, req.query);
    respond(res, products);
  } catch (err) { fail(res, err); }
};

// GET /sellers/:id/services
const getSellerServices = async (req, res) => {
  try {
    const services = await SellerService.getSellerServices(+req.params.id, req.query);
    respond(res, services);
  } catch (err) { fail(res, err); }
};

// GET /sellers/:id/payouts
const getSellerPayouts = async (req, res) => {
  try {
    const payouts = await SellerService.getSellerPayouts(+req.params.id);
    respond(res, payouts);
  } catch (err) { fail(res, err); }
};

module.exports = { createSeller, getAllSellers, getSellerById, updateSeller, getSellerProducts, getSellerServices, getSellerPayouts };