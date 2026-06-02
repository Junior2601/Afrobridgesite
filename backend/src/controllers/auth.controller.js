const { AuthService } = require('../services/auth.service');
const { catchAsync } = require('../utils/catchAsync');

// POST /api/auth/register
const register = catchAsync(async (req, res) => {
  const { full_name, email, phone, password, role } = req.body;
  const { user, token } = await AuthService.register({
    full_name,
    email,
    phone,
    password,
    role,
  });
  res.status(201).json({ user, token });
});

// POST /api/auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await AuthService.login({ email, password });
  res.json({ user, token });
});

// GET /api/auth/me  (protégée — req.user est rempli par le middleware protect)
const getMe = catchAsync(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getMe };