const { Router } = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', register);   // inscription
router.post('/login', login);         // connexion
router.get('/me', protect, getMe);    // profil de l'utilisateur connecté (protégée)

module.exports = router;