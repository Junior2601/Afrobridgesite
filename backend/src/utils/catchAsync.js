// Enveloppe un contrôleur asynchrone : toute erreur est automatiquement
// transmise au gestionnaire d'erreurs global d'Express (via next).
// Évite d'écrire un try/catch dans chaque contrôleur.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { catchAsync };