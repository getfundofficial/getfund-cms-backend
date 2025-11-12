const { pool } = require('../config/database');

class AuditLog {
  // Create audit log entry
  static async create({ user_id, action, entity_type, entity_id, changes, ip_address, user_agent }) {
    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, action, entity_type, entity_id, changes, ip_address, user_agent]
    );
    return result.rows[0];
  }

  // Get all logs with filters
  static async getAll({ user_id, entity_type, entity_id, action, limit = 100, offset = 0 }) {
    let query = `
      SELECT a.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND a.user_id = $${paramIndex++}`;
      values.push(user_id);
    }
    if (entity_type) {
      query += ` AND a.entity_type = $${paramIndex++}`;
      values.push(entity_type);
    }
    if (entity_id) {
      query += ` AND a.entity_id = $${paramIndex++}`;
      values.push(entity_id);
    }
    if (action) {
      query += ` AND a.action = $${paramIndex++}`;
      values.push(action);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get logs for specific content
  static async getForContent(content_id) {
    const result = await pool.query(
      `SELECT a.*, u.full_name as user_name, u.email as user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.entity_type = 'content' AND a.entity_id = $1
       ORDER BY a.created_at DESC`,
      [content_id]
    );
    return result.rows;
  }
}

module.exports = AuditLog;
