const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

// Routeur central : on monte ici tous les modules de routes.
// app.js montera ce routeur sous le préfixe /api.
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// --- À venir (étapes suivantes) ---
// router.use('/products', productRoutes);
// router.use('/services', serviceRoutes);
// router.use('/properties', propertyRoutes);
// ...

module.exports = router;