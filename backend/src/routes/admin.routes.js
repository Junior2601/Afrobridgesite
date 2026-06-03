const { Router } = require('express');
const ctrl = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = Router();

// Toutes les routes admin nécessitent un token valide + rôle admin
router.use(protect, restrictTo('admin'));

// ── CRUD admins ───────────────────────────────────────────────────────────────
router.post('/',          ctrl.createAdmin);      // Créer un admin
router.get('/',           ctrl.getAllAdmins);      // Lister tous les admins
router.get('/stats',      ctrl.getGlobalStats);   // Statistiques globales
router.get('/:id',        ctrl.getAdminById);     // Détail d'un admin
router.patch('/:id',      ctrl.updateAdmin);      // Modifier un admin
router.delete('/:id',     ctrl.deactivateAdmin);  // Désactiver un admin

// ── Actions de validation ─────────────────────────────────────────────────────
router.patch('/shops/:shopId/validate',       ctrl.validateShop);      // Valider une boutique
router.patch('/services/:serviceId/validate', ctrl.validateService);   // Valider un service
router.patch('/agents/:profileId/validate',   ctrl.validateAgent);     // Valider un agent

// ── Paiements ─────────────────────────────────────────────────────────────────
router.patch('/payments/:paymentId/confirm',  ctrl.confirmPayment);    // Confirmer un paiement

module.exports = router;