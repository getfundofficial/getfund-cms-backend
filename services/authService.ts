import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '@/models/User';
import { jwtConfig } from '@/lib/jwt';
import { AuditLogModel } from '@/models/AuditLog';

export class AuthService {
  // Login user
  static async login(email: string, password: string, ipAddress: string, userAgent: string) {
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Check if user is active
    if (!user.is_active) {
      const error: any = new Error('Account is deactivated');
      error.status = 403;
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash || '');
    if (!isValidPassword) {
      const error: any = new Error('Invalid email or password');
      error.status = 401;
      throw error;
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
    await AuditLogModel.create({
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
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as { userId: string };

      // Get user
      const user = await UserModel.findById(decoded.userId);
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
      const err: any = new Error('Invalid refresh token');
      err.status = 401;
      throw err;
    }
  }

  // Get current user
  static async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.status = 404;
      throw error;
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
