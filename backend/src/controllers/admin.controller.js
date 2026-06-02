const AdminService = require('../services/admin.service');

/**
 * admin.controller.js
 * GÃ¨re les requÃĒtes HTTP et dÃŠlÃ¨gue la logique au service.
 */

const respond = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail    = (res, err) => res.status(err.status ?? 500).json({ success: false, message: err.message ?? 'Erreur serveur.' });

// POST /admins
const createAdmin = async (req, res) => {
  try {
    const admin = await AdminService.createAdmin(req.body);
    respond(res, admin, 201);
  } catch (err) { fail(res, err); }
};

// GET /admins
const getAllAdmins = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const admins = await AdminService.getAllAdmins({ page: +page || 1, limit: +limit || 20 });
    respond(res, admins);
  } catch (err) { fail(res, err); }
};

// GET /admins/:id
const getAdminById = async (req, res) => {
  try {
    const admin = await AdminService.getAdminById(+req.params.id);
    respond(res, admin);
  } catch (err) { fail(res, err); }
};

// PATCH /admins/:id
const updateAdmin = async (req, res) => {
  try {
    const admin = await AdminService.updateAdmin(+req.params.id, req.body);
    respond(res, admin);
  } catch (err) { fail(res, err); }
};

// DELETE /admins/:id  (dÃŠsactivation douce)
const deactivateAdmin = async (req, res) => {
  try {
    const admin = await AdminService.deactivateAdmin(+req.params.id);
    respond(res, admin);
  } catch (err) { fail(res, err); }
};

// PATCH /admins/shops/:shopId/validate
const validateShop = async (req, res) => {
  try {
    const shop = await AdminService.validateShop(+req.params.shopId, req.user.id, req.body);
    respond(res, shop);
  } catch (err) { fail(res, err); }
};

// PATCH /admins/services/:serviceId/validate
const validateService = async (req, res) => {
  try {
    const service = await AdminService.validateService(+req.params.serviceId, req.user.id, req.body);
    respond(res, service);
  } catch (err) { fail(res, err); }
};

// PATCH /admins/agents/:profileId/validate
const validateAgent = async (req, res) => {
  try {
    const profile = await AdminService.validateAgent(+req.params.profileId, req.user.id, req.body);
    respond(res, profile);
  } catch (err) { fail(res, err); }
};

// PATCH /admins/payments/:paymentId/confirm
const confirmPayment = async (req, res) => {
  try {
    const payment = await AdminService.confirmPayment(+req.params.paymentId, req.user.id);
    respond(res, payment);
  } catch (err) { fail(res, err); }
};

// GET /admins/stats
const getGlobalStats = async (req, res) => {
  try {
    const stats = await AdminService.getGlobalStats();
    respond(res, stats);
  } catch (err) { fail(res, err); }
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