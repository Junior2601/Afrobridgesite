// On charge les variables d'environnement avant tout le reste.
require('dotenv').config();

const app = require('./app');

// Render fournit automatiquement la variable PORT.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`   Test : http://localhost:${PORT}/api/health`);
});