const ClientService = require('../services/client.service');

const respond = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail    = (res, err) => res.status(err.status ?? 500).json({ success: false, message: err.message ?? 'Erreur serveur.' });

// POST /clients
const createClient = async (req, res) => {
  try {
    const client = await ClientService.createClient(req.body);
    respond(res, client, 201);
  } catch (err) { fail(res, err); }
};

// GET /clients
const getAllClients = async (req, res) => {
  try {
    const clients = await ClientService.getAllClients({ page: +req.query.page || 1, limit: +req.query.limit || 20 });
    respond(res, clients);
  } catch (err) { fail(res, err); }
};

// GET /clients/:id
const getClientById = async (req, res) => {
  try {
    const client = await ClientService.getClientById(+req.params.id);
    respond(res, client);
  } catch (err) { fail(res, err); }
};

// PATCH /clients/:id
const updateClient = async (req, res) => {
  try {
    const client = await ClientService.updateClient(+req.params.id, req.body);
    respond(res, client);
  } catch (err) { fail(res, err); }
};

// GET /clients/:id/orders
const getClientOrders = async (req, res) => {
  try {
    const orders = await ClientService.getClientOrders(+req.params.id, {
      page: +req.query.page || 1, limit: +req.query.limit || 20,
    });
    respond(res, orders);
  } catch (err) { fail(res, err); }
};

// GET /clients/:id/favorites
const getClientFavorites = async (req, res) => {
  try {
    const favorites = await ClientService.getClientFavorites(+req.params.id);
    respond(res, favorites);
  } catch (err) { fail(res, err); }
};

module.exports = { createClient, getAllClients, getClientById, updateClient, getClientOrders, getClientFavorites };