const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const AuditLog = require('../models/AuditLog');

class AuthService {
  // Login user
  static async login(email, password, ipAddress, userAgent) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn }
    );

    // Log login
    await AuditLog.create({
      user_id: user.id,
      action: 'login',
      entity_type: 'user',
      entity_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        permissions: user.permissions || []
      },
      accessToken,
      refreshToken
    };
  }

  // Refresh access token
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.is_active) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions || []
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Get current user
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      permissions: user.permissions || [],
      is_active: user.is_active,
      created_at: user.created_at
    };
  }
}

module.exports = AuthService;
