const { Router } = require('express');
const ctrl = require('../controllers/seller.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = Router();

// Inscription publique
router.post('/', ctrl.createSeller);

router.use(authenticate);

router.get('/',                requireRole('admin'),            ctrl.getAllSellers);
router.get('/:id',             requireRole('admin', 'seller'),  ctrl.getSellerById);
router.patch('/:id',           requireRole('admin', 'seller'),  ctrl.updateSeller);
router.get('/:id/products',    requireRole('admin', 'seller'),  ctrl.getSellerProducts);
router.get('/:id/services',    requireRole('admin', 'seller'),  ctrl.getSellerServices);
router.get('/:id/payouts',     requireRole('admin', 'seller'),  ctrl.getSellerPayouts);

module.exports = router;