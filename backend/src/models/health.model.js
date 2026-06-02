const { query } = require('../config/db');

// COUCHE MODEL : uniquement de l'accès aux données (SQL).
// Aucune logique métier ici, aucune notion de HTTP.
const HealthModel = {
  async getDbTime() {
    const result = await query('SELECT NOW() AS time');
    return result.rows[0].time;
  },
};

module.exports = { HealthModel };