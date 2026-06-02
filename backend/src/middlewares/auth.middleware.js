const { verifyToken } = require('../utils/jwt');
const { UserModel } = require('../models/user.model');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// protect : vérifie le token JWT et charge l'utilisateur dans req.user.
// À mettre sur toute route nécessitant d'être connecté.
const protect = catchAsync(async (req, res, next) => {
  // 1. Récupérer le token depuis l'en-tête "Authorization: Bearer <token>"
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Non authentifié : token manquant', 401);
  }

  // 2. Vérifier la validité du token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new AppError('Token invalide ou expiré', 401);
  }

  // 3. Vérifier que l'utilisateur existe toujours
  const user = await UserModel.findById(decoded.id);
  if (!user) {
    throw new AppError("Cet utilisateur n'existe plus", 401);
  }
  if (!user.is_active) {
    throw new AppError('Ce compte est désactivé', 403);
  }

  // 4. Attacher l'utilisateur à la requête pour la suite
  req.user = user;
  next();
});

// restrictTo : limite l'accès à certains rôles.
// Exemples : restrictTo('admin')  /  restrictTo('seller', 'admin')
// À placer APRÈS protect dans la chaîne de la route.
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(
      new AppError("Vous n'avez pas la permission d'effectuer cette action", 403)
    );
  }
  next();
};

module.exports = { protect, restrictTo };