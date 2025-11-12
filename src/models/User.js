const { pool } = require('../config/database');

class User {
  // Find user by email
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get all users
  static async getAll() {
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Create new user
  static async create({ email, password_hash, full_name, role }) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, password_hash, full_name, role]
    );
    return result.rows[0];
  }

  // Update user
  static async update(id, { email, full_name, role, is_active }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (full_name !== undefined) {
      fields.push(`full_name = $${paramIndex++}`);
      values.push(full_name);
    }
    if (role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, full_name, role, is_active, updated_at`,
      values
    );
    return result.rows[0];
  }

  // Deactivate user
  static async deactivate(id) {
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = User;
