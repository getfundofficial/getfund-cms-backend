import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePartnerInput {
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdatePartnerInput {
  name?: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

class PartnerModel {
  /**
   * Get all partners (for CMS admin)
   */
  async getAll(): Promise<Partner[]> {
    const result = await sql`
      SELECT * FROM partners
      ORDER BY display_order ASC, created_at DESC
    `;
    return result as Partner[];
  }

  /**
   * Get active partners (for public website)
   */
  async getActive(): Promise<Partner[]> {
    const result = await sql`
      SELECT * FROM partners
      WHERE is_active = true
      ORDER BY display_order ASC, created_at DESC
    `;
    return result as Partner[];
  }

  /**
   * Get a single partner by ID
   */
  async getById(id: string): Promise<Partner | null> {
    const result = await sql`
      SELECT * FROM partners
      WHERE id = ${id}
    `;
    return (result[0] as Partner) || null;
  }

  /**
   * Create a new partner
   */
  async create(data: CreatePartnerInput): Promise<Partner> {
    const result = await sql`
      INSERT INTO partners (
        name, logo_url, website_url, description, display_order, is_active
      )
      VALUES (
        ${data.name},
        ${data.logo_url},
        ${data.website_url || null},
        ${data.description || null},
        ${data.display_order || 0},
        ${data.is_active !== undefined ? data.is_active : true}
      )
      RETURNING *
    `;
    return result[0] as Partner;
  }

  /**
   * Update a partner
   */
  async update(id: string, data: UpdatePartnerInput): Promise<Partner> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.logo_url !== undefined) {
      updates.push(`logo_url = $${paramIndex++}`);
      values.push(data.logo_url);
    }
    if (data.website_url !== undefined) {
      updates.push(`website_url = $${paramIndex++}`);
      values.push(data.website_url);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.display_order !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      values.push(data.display_order);
    }
    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE partners
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql(query, values);
    return result[0] as Partner;
  }

  /**
   * Delete a partner
   */
  async delete(id: string): Promise<void> {
    await sql`
      DELETE FROM partners
      WHERE id = ${id}
    `;
  }

  /**
   * Update display order for multiple partners
   */
  async updateOrder(orderData: { id: string; display_order: number }[]): Promise<void> {
    for (const item of orderData) {
      await sql`
        UPDATE partners
        SET display_order = ${item.display_order}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${item.id}
      `;
    }
  }
}

export default new PartnerModel();
