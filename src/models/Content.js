const { pool } = require('../config/database');

class Content {
  // Get all content (with filters)
  static async getAll({ type, status, created_by, limit = 50, offset = 0 }) {
    let query = `
      SELECT c.*,
             u.full_name as creator_name,
             r.full_name as reviewer_name,
             a.full_name as approver_name
      FROM content c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN users r ON c.reviewed_by = r.id
      LEFT JOIN users a ON c.approved_by = a.id
      WHERE c.deleted_at IS NULL
    `;
    const values = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND c.type = $${paramIndex++}`;
      values.push(type);
    }
    if (status) {
      query += ` AND c.status = $${paramIndex++}`;
      values.push(status);
    }
    if (created_by) {
      query += ` AND c.created_by = $${paramIndex++}`;
      values.push(created_by);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get published content for public API
  static async getPublished(type) {
    let query = `
      SELECT id, type, title, slug, excerpt, body, author, category,
             featured_image_url, meta_data, published_at
      FROM content
      WHERE status = 'published' AND deleted_at IS NULL
    `;
    const values = [];

    if (type) {
      query += ' AND type = $1';
      values.push(type);
    }

    query += ' ORDER BY published_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get single content by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT c.*,
              u.full_name as creator_name,
              r.full_name as reviewer_name,
              a.full_name as approver_name,
              p.full_name as publisher_name
       FROM content c
       LEFT JOIN users u ON c.created_by = u.id
       LEFT JOIN users r ON c.reviewed_by = r.id
       LEFT JOIN users a ON c.approved_by = a.id
       LEFT JOIN users p ON c.published_by = p.id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    );
    return result.rows[0];
  }

  // Get single published content by slug (for public website)
  static async findBySlug(slug) {
    const result = await pool.query(
      `SELECT id, type, title, slug, excerpt, body, author, category,
              featured_image_url, meta_data, published_at
       FROM content
       WHERE slug = $1 AND status = 'published' AND deleted_at IS NULL`,
      [slug]
    );
    return result.rows[0];
  }

  // Create content
  static async create(data) {
    const {
      type, title, slug, excerpt, body, author, category,
      featured_image_url, meta_data, created_by
    } = data;

    const result = await pool.query(
      `INSERT INTO content (type, title, slug, excerpt, body, author, category,
                           featured_image_url, meta_data, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [type, title, slug, excerpt, body, author, category, featured_image_url, meta_data, created_by]
    );
    return result.rows[0];
  }

  // Update content
  static async update(id, data) {
    const {
      title, slug, excerpt, body, author, category,
      featured_image_url, meta_data
    } = data;

    const result = await pool.query(
      `UPDATE content
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           excerpt = COALESCE($3, excerpt),
           body = COALESCE($4, body),
           author = COALESCE($5, author),
           category = COALESCE($6, category),
           featured_image_url = COALESCE($7, featured_image_url),
           meta_data = COALESCE($8, meta_data),
           updated_at = NOW()
       WHERE id = $9 AND deleted_at IS NULL
       RETURNING *`,
      [title, slug, excerpt, body, author, category, featured_image_url, meta_data, id]
    );
    return result.rows[0];
  }

  // Update status (workflow transitions)
  static async updateStatus(id, status, userId, notes = null) {
    const updates = ['status = $1', 'updated_at = NOW()'];
    const values = [status];
    let paramIndex = 2;

    if (status === 'in_review') {
      updates.push(`submitted_for_review_at = NOW()`);
    } else if (status === 'approved') {
      updates.push(`reviewed_by = $${paramIndex++}`, `reviewed_at = NOW()`);
      values.push(userId);
    } else if (status === 'published') {
      updates.push(`published_by = $${paramIndex++}`, `published_at = NOW()`);
      values.push(userId);
    } else if (status === 'changes_requested' && notes) {
      updates.push(`reviewed_by = $${paramIndex++}`, `reviewed_at = NOW()`, `review_notes = $${paramIndex++}`);
      values.push(userId, notes);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE content SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  // Soft delete
  static async softDelete(id) {
    const result = await pool.query(
      'UPDATE content SET deleted_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Get count by status
  static async getCountByStatus(userId = null, role = null) {
    let query = `
      SELECT status, COUNT(*) as count
      FROM content
      WHERE deleted_at IS NULL
    `;
    const values = [];

    // Creators only see their own content
    if (role === 'creator' && userId) {
      query += ' AND created_by = $1';
      values.push(userId);
    }

    query += ' GROUP BY status';

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Content;
