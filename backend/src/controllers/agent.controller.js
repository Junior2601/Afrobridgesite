const AgentService = require('../services/agent.service');

const respond = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail    = (res, err) => res.status(err.status ?? 500).json({ success: false, message: err.message ?? 'Erreur serveur.' });

// POST /agents
const createAgent = async (req, res) => {
  try {
    const agent = await AgentService.createAgent(req.body);
    respond(res, agent, 201);
  } catch (err) { fail(res, err); }
};

// GET /agents
const getAllAgents = async (req, res) => {
  try {
    const agents = await AgentService.getAllAgents({ page: +req.query.page || 1, limit: +req.query.limit || 20 });
    respond(res, agents);
  } catch (err) { fail(res, err); }
};

// GET /agents/:id
const getAgentById = async (req, res) => {
  try {
    const agent = await AgentService.getAgentById(+req.params.id);
    respond(res, agent);
  } catch (err) { fail(res, err); }
};

// PATCH /agents/:id
const updateAgent = async (req, res) => {
  try {
    const agent = await AgentService.updateAgent(+req.params.id, req.body);
    respond(res, agent);
  } catch (err) { fail(res, err); }
};

// GET /agents/:id/properties
const getAgentProperties = async (req, res) => {
  try {
    const props = await AgentService.getAgentProperties(+req.params.id, req.query);
    respond(res, props);
  } catch (err) { fail(res, err); }
};

// GET /agents/:id/visits
const getAgentVisits = async (req, res) => {
  try {
    const visits = await AgentService.getAgentVisits(+req.params.id, req.query);
    respond(res, visits);
  } catch (err) { fail(res, err); }
};

module.exports = { createAgent, getAllAgents, getAgentById, updateAgent, getAgentProperties, getAgentVisits };