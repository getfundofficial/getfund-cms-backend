const { pool } = require('../config/database');

class Revision {
  // Create revision
  static async create({ content_id, version_number, title, excerpt, body, meta_data, created_by }) {
    const result = await pool.query(
      `INSERT INTO content_revisions (content_id, version_number, title, excerpt, body, meta_data, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [content_id, version_number, title, excerpt, body, meta_data, created_by]
    );
    return result.rows[0];
  }

  // Get all revisions for content
  static async getForContent(content_id) {
    const result = await pool.query(
      `SELECT r.*, u.full_name as creator_name
       FROM content_revisions r
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.content_id = $1
       ORDER BY r.version_number DESC`,
      [content_id]
    );
    return result.rows;
  }

  // Get specific revision
  static async findByVersion(content_id, version_number) {
    const result = await pool.query(
      'SELECT * FROM content_revisions WHERE content_id = $1 AND version_number = $2',
      [content_id, version_number]
    );
    return result.rows[0];
  }

  // Get latest version number
  static async getLatestVersionNumber(content_id) {
    const result = await pool.query(
      'SELECT MAX(version_number) as max_version FROM content_revisions WHERE content_id = $1',
      [content_id]
    );
    return result.rows[0]?.max_version || 0;
  }
}

module.exports = Revision;
