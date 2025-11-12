const { pool } = require('../config/database');

class Media {
  // Create media record
  static async create({ filename, original_name, mime_type, size_bytes, file_path, url, alt_text, uploaded_by }) {
    const result = await pool.query(
      `INSERT INTO media (filename, original_name, mime_type, size_bytes, file_path, url, alt_text, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [filename, original_name, mime_type, size_bytes, file_path, url, alt_text, uploaded_by]
    );
    return result.rows[0];
  }

  // Get all media
  static async getAll({ uploaded_by, limit = 50, offset = 0 }) {
    let query = `
      SELECT m.*, u.full_name as uploader_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (uploaded_by) {
      query += ` AND m.uploaded_by = $${paramIndex++}`;
      values.push(uploaded_by);
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Find by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT m.*, u.full_name as uploader_name
       FROM media m
       LEFT JOIN users u ON m.uploaded_by = u.id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Update alt text
  static async updateAltText(id, alt_text) {
    const result = await pool.query(
      'UPDATE media SET alt_text = $1 WHERE id = $2 RETURNING *',
      [alt_text, id]
    );
    return result.rows[0];
  }

  // Delete media
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM media WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Media;
