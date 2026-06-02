const { HealthModel } = require('../models/health.model');

// COUCHE SERVICE : la logique métier.
// Orchestre un ou plusieurs models, applique les règles, met en forme les données.
// Ne connaît pas req/res (pas de HTTP ici).
const HealthService = {
  async check() {
    const dbTime = await HealthModel.getDbTime();
    return {
      status: 'ok',
      message: 'API en ligne 🚀',
      db_time: dbTime,
    };
  },
};

module.exports = { HealthService };