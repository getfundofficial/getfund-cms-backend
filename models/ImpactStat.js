const pool = require('../lib/db');

class ImpactStat {
  // Get all impact stats, optionally filtered by page
  static async getAll(page = null) {
    try {
      let query = `
        SELECT * FROM impact_stats 
        WHERE is_active = true
      `;
      const params = [];
      
      if (page) {
        query += ` AND (page = $1 OR page = 'all')`;
        params.push(page);
      }
      
      query += ` ORDER BY order_number ASC, created_at DESC`;
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching impact stats:', error);
      throw error;
    }
  }

  // Get single impact stat by ID
  static async getById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM impact_stats WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching impact stat:', error);
      throw error;
    }
  }

  // Create new impact stat
  static async create(data) {
    const { title, value, color, page, order_number } = data;
    
    try {
      const result = await pool.query(
        `INSERT INTO impact_stats (title, value, color, page, order_number, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING *`,
        [title, value, color, page, order_number]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating impact stat:', error);
      throw error;
    }
  }

  // Update impact stat
  static async update(id, data) {
    const { title, value, color, page, order_number, is_active } = data;
    
    try {
      const result = await pool.query(
        `UPDATE impact_stats 
         SET title = COALESCE($1, title),
             value = COALESCE($2, value),
             color = COALESCE($3, color),
             page = COALESCE($4, page),
             order_number = COALESCE($5, order_number),
             is_active = COALESCE($6, is_active),
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [title, value, color, page, order_number, is_active, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating impact stat:', error);
      throw error;
    }
  }

  // Delete impact stat (soft delete)
  static async delete(id) {
    try {
      const result = await pool.query(
        `UPDATE impact_stats 
         SET is_active = false, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting impact stat:', error);
      throw error;
    }
  }

  // Reorder stats
  static async reorder(updates) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const update of updates) {
        await client.query(
          'UPDATE impact_stats SET order_number = $1, updated_at = NOW() WHERE id = $2',
          [update.order_number, update.id]
        );
      }
      
      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error reordering impact stats:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get subtitle for a page
  static async getSubtitle(page) {
    try {
      const result = await pool.query(
        'SELECT subtitle FROM impact_stats_config WHERE page = $1',
        [page]
      );
      return result.rows[0]?.subtitle || '25+ years of giving';
    } catch (error) {
      console.error('Error fetching impact stats subtitle:', error);
      return '25+ years of giving';
    }
  }

  // Update subtitle for a page
  static async updateSubtitle(page, subtitle) {
    try {
      const result = await pool.query(
        `INSERT INTO impact_stats_config (page, subtitle, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (page)
         DO UPDATE SET subtitle = $2, updated_at = NOW()
         RETURNING *`,
        [page, subtitle]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating impact stats subtitle:', error);
      throw error;
    }
  }
}

module.exports = ImpactStat;
