// Erreur "métier" maîtrisée, levée depuis la couche services.
// Exemple : throw new AppError('Email déjà utilisé', 409);
// Le gestionnaire d'erreurs global lira statusCode pour répondre proprement.
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // erreur prévue (vs bug imprévu)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };