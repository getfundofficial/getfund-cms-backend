const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login
router.post('/login', authLimiter, AuthController.login);

// POST /api/auth/refresh
router.post('/refresh', AuthController.refresh);

// GET /api/auth/me
router.get('/me', auth, AuthController.getCurrentUser);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

module.exports = router;
