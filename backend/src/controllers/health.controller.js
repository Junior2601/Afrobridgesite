const { HealthService } = require('../services/health.service');
const { catchAsync } = require('../utils/catchAsync');

// COUCHE CONTROLLER : gère uniquement le HTTP.
// Lit la requête, appelle le service, renvoie la réponse. Pas de SQL, pas de règle métier.
const healthCheck = catchAsync(async (req, res) => {
  const data = await HealthService.check();
  res.json(data);
});

module.exports = { healthCheck };