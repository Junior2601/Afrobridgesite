const { Router } = require('express');
const ctrl = require('../controllers/agent.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = Router();

// Inscription publique
router.post('/', ctrl.createAgent);

router.use(protect);

router.get('/',                 restrictTo('admin'),           ctrl.getAllAgents);
router.get('/:id',              restrictTo('admin', 'agent'),  ctrl.getAgentById);
router.patch('/:id',            restrictTo('admin', 'agent'),  ctrl.updateAgent);
router.get('/:id/properties',   restrictTo('admin', 'agent'),  ctrl.getAgentProperties);
router.get('/:id/visits',       restrictTo('admin', 'agent'),  ctrl.getAgentVisits);

module.exports = router;