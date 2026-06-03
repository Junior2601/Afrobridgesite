const { Router } = require('express');
const ctrl = require('../controllers/client.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = Router();

// Inscription publique (pas de token requis)
router.post('/', ctrl.createClient);

// Routes protégées — admin ou le client lui-même (filtrage dans le service si nécessaire)
router.use(protect);

router.get('/',                    restrictTo('admin'),            ctrl.getAllClients);
router.get('/:id',                 restrictTo('admin', 'client'),  ctrl.getClientById);
router.patch('/:id',               restrictTo('admin', 'client'),  ctrl.updateClient);
router.get('/:id/orders',          restrictTo('admin', 'client'),  ctrl.getClientOrders);
router.get('/:id/favorites',       restrictTo('admin', 'client'),  ctrl.getClientFavorites);

module.exports = router;