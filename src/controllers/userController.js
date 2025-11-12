const bcrypt = require('bcrypt');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

class UserController {
  // GET /api/users
  static async getAll(req, res, next) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users/:id
  static async getById(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/users
  static async create(req, res, next) {
    try {
      const { email, full_name, role, password } = req.body;

      // Validation
      if (!email || !full_name || !role) {
        return res.status(400).json({ error: 'Email, full name, and role are required' });
      }

      // Generate password if not provided
      const plainPassword = password || crypto.randomBytes(8).toString('hex');

      // Hash password
      const password_hash = await bcrypt.hash(plainPassword, 10);

      const user = await User.create({
        email,
        password_hash,
        full_name,
        role
      });

      // Log action
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      await AuditLog.create({
        user_id: req.user.id,
        action: 'created_user',
        entity_type: 'user',
        entity_id: user.id,
        changes: { email, role },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      res.status(201).json({
        user,
        temporaryPassword: plainPassword
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/users/:id
  static async update(req, res, next) {
    try {
      const { email, full_name, role, is_active } = req.body;

      const user = await User.update(req.params.id, {
        email,
        full_name,
        role,
        is_active
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log action
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      await AuditLog.create({
        user_id: req.user.id,
        action: 'updated_user',
        entity_type: 'user',
        entity_id: req.params.id,
        changes: { email, full_name, role, is_active },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/users/:id (deactivate)
  static async deactivate(req, res, next) {
    try {
      // Can't deactivate yourself
      if (req.params.id === req.user.id) {
        return res.status(400).json({ error: 'Cannot deactivate your own account' });
      }

      const user = await User.deactivate(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log action
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      await AuditLog.create({
        user_id: req.user.id,
        action: 'deactivated_user',
        entity_type: 'user',
        entity_id: req.params.id,
        ip_address: ipAddress,
        user_agent: userAgent
      });

      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
