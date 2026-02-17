import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '@/models/User';
import { jwtConfig } from '@/lib/jwt';
import { AuditLogModel } from '@/models/AuditLog';

export class AuthService {
  // Login user
  static async login(email: string, password: string, ipAddress: string, userAgent: string) {
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Log failed login attempt (email not found)
      await AuditLogModel.create({
        user_id: 'unknown',
        action: 'failed_login',
        entity_type: 'auth',
        entity_id: email,
        changes: {
          reason: 'email_not_found',
          email: email
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      const error: any = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Check if user is active
    if (!user.is_active) {
      // Log failed login attempt (account deactivated)
      await AuditLogModel.create({
        user_id: user.id,
        action: 'failed_login',
        entity_type: 'auth',
        entity_id: user.id,
        changes: {
          reason: 'account_deactivated',
          email: email
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      const error: any = new Error('Account is deactivated');
      error.status = 403;
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash || '');
    if (!isValidPassword) {
      // Log failed login attempt (invalid password)
      await AuditLogModel.create({
        user_id: user.id,
        action: 'failed_login',
        entity_type: 'auth',
        entity_id: user.id,
        changes: {
          reason: 'invalid_password',
          email: email
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

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
        permissions: user.permissions || null
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions
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
        permissions: user.permissions || null,
        must_change_password: user.must_change_password
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
          permissions: user.permissions || null
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn } as SignOptions
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
      permissions: user.permissions || null,
      is_active: user.is_active,
      must_change_password: user.must_change_password,
      created_at: user.created_at
    };
  }
}
