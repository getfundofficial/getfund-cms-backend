const AuthService = require('../services/authService');
const jwtConfig = require('../config/jwt');

class AuthController {
  // POST /api/auth/login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await AuthService.login(email, password, ipAddress, userAgent);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, jwtConfig.cookieOptions);

      res.json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  static async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.json(result);
    } catch (error) {
      res.clearCookie('refreshToken');
      next(error);
    }
  }

  // GET /api/auth/me
  static async getCurrentUser(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  static async logout(req, res) {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = AuthController;
