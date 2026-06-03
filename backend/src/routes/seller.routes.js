const { Router } = require('express');
const ctrl = require('../controllers/seller.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = Router();

// Inscription publique
router.post('/', ctrl.createSeller);

router.use(protect);

router.get('/',                restrictTo('admin'),            ctrl.getAllSellers);
router.get('/:id',             restrictTo('admin', 'seller'),  ctrl.getSellerById);
router.patch('/:id',           restrictTo('admin', 'seller'),  ctrl.updateSeller);
router.get('/:id/products',    restrictTo('admin', 'seller'),  ctrl.getSellerProducts);
router.get('/:id/services',    restrictTo('admin', 'seller'),  ctrl.getSellerServices);
router.get('/:id/payouts',     restrictTo('admin', 'seller'),  ctrl.getSellerPayouts);

module.exports = router;