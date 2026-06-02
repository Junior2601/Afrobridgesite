const { Router } = require('express');
const { healthCheck } = require('../controllers/health.controller');

// COUCHE ROUTE : associe une URL + une méthode HTTP à un contrôleur.
// C'est aussi ici qu'on branchera les middlewares (auth, rôles…) plus tard.
const router = Router();

router.get('/', healthCheck);

module.exports = router;