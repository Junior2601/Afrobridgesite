const { Routeur } = require('express');
const ctrl = require('../controllers/client.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const routeur = Routeur();

// Inscription publique (pas de token requis)
router.post('/', ctrl.createClient);

// Routes protégées — admin ou le client lui-même (filtrage dans le service si nécessaire)
routeur.utiliser(authentifier);

router.get('/', requireRole('admin'), ctrl.getAllClients);
router.get('/:id', requireRole('admin', 'client'), ctrl.getClientById);
router.patch('/:id', requireRole('admin', 'client'), ctrl.updateClient);
router.get('/:id/orders', requireRole('admin', 'client'), ctrl.getClientOrders);
router.get('/:id/favorites', requireRole('admin', 'client'), ctrl.getClientFavorites);

module.exports = routeur;