const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes  = require('./admin.routes');
const clientRoutes = require('./client.routes');
const sellerRoutes = require('./seller.routes');
const agentRoutes  = require('./agent.routes');

// Routeur central : on monte ici tous les modules de routes.
// app.js montera ce routeur sous le préfixe /api.
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admins',  adminRoutes);
router.use('/clients', clientRoutes);
router.use('/sellers', sellerRoutes);
router.use('/agents',  agentRoutes);

// --- À venir (étapes suivantes) ---
// router.use('/products', productRoutes);
// router.use('/services', serviceRoutes);
// router.use('/properties', propertyRoutes);
// ...

module.exports = router;