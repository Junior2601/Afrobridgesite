const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// --- Middlewares globaux ---
app.use(helmet());                               // en-têtes de sécurité
app.use(cors());                                 // autorise les requêtes du frontend
app.use(express.json());                         // parse le JSON entrant
app.use(express.urlencoded({ extended: true })); // parse les formulaires

// Logs des requêtes en développement
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- Toutes les routes de l'API sont préfixées par /api ---
app.use('/api', routes);

// --- 404 : route inconnue ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// --- Gestionnaire d'erreurs global ---
// Reçoit les erreurs transmises par catchAsync (et donc par AppError).
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  // On loggue le détail uniquement pour les vraies erreurs serveur.
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({
    message: err.message || 'Erreur serveur',
  });
});

module.exports = app;