const bcrypt = require('bcryptjs');
const { UserModel } = require('../models/user.model');
const { signToken } = require('../utils/jwt');
const { AppError } = require('../utils/appError');

// Rôles autorisés à l'inscription. 'admin' n'est JAMAIS attribuable ici
// (il est créé manuellement / via le seed de la base).
const ALLOWED_ROLES = ['client', 'seller', 'agent'];

const AuthService = {
  async register({ full_name, email, phone, password, role }) {
    // --- Validations de base ---
    if (!full_name || !email || !password) {
      throw new AppError('Nom, email et mot de passe sont obligatoires', 400);
    }
    if (password.length < 6) {
      throw new AppError('Le mot de passe doit faire au moins 6 caractères', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rôle sécurisé : on retombe sur 'client' si la valeur n'est pas autorisée.
    const safeRole = ALLOWED_ROLES.includes(role) ? role : 'client';

    // --- Email déjà utilisé ? ---
    const existing = await UserModel.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }

    // --- Hash du mot de passe ---
    const password_hash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      full_name: full_name.trim(),
      email: normalizedEmail,
      phone,
      password_hash,
      role: safeRole,
    });

    const token = signToken({ id: user.id, role: user.role });
    return { user, token };
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Email et mot de passe requis', 400);
    }

    const user = await UserModel.findByEmail(email.trim().toLowerCase());

    // Message volontairement identique pour email inexistant OU mauvais mot de passe
    // (on n'indique pas à un attaquant si l'email existe).
    if (!user) {
      throw new AppError('Identifiants invalides', 401);
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      throw new AppError('Identifiants invalides', 401);
    }

    if (!user.is_active) {
      throw new AppError('Ce compte est désactivé', 403);
    }

    const token = signToken({ id: user.id, role: user.role });

    // On retire le hash avant de renvoyer l'utilisateur.
    delete user.password_hash;
    return { user, token };
  },
};

module.exports = { AuthService };