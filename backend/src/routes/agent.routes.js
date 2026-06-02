const { Router } = require('express');
const ctrl = require('../controllers/agent.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = Router();

// Inscription publique
router.post('/', ctrl.createAgent);

router.use(authenticate);

router.get('/',                 requireRole('admin'),           ctrl.getAllAgents);
router.get('/:id',              requireRole('admin', 'agent'),  ctrl.getAgentById);
router.patch('/:id',            requireRole('admin', 'agent'),  ctrl.updateAgent);
router.get('/:id/properties',   requireRole('admin', 'agent'),  ctrl.getAgentProperties);
router.get('/:id/visits',       requireRole('admin', 'agent'),  ctrl.getAgentVisits);

module.exports = router;