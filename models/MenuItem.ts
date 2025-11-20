import { query } from '@/lib/db';

export interface MenuItem {
  id: number;
  label: string;
  url: string;
  page_slug: string | null;
  order_index: number;
  is_active: boolean;
  item_type: 'menu' | 'cta';
  created_at: Date;
  updated_at: Date;
}

export interface CreateMenuItemInput {
  label: string;
  url: string;
  page_slug?: string;
  order_index: number;
  is_active?: boolean;
  item_type: 'menu' | 'cta';
}

export interface UpdateMenuItemInput {
  label?: string;
  url?: string;
  page_slug?: string | null;
  order_index?: number;
  is_active?: boolean;
}

export const MenuItemModel = {
  async getAll(): Promise<MenuItem[]> {
    const result = await query(
      'SELECT * FROM menu_items ORDER BY item_type, order_index'
    );
    return result.rows as MenuItem[];
  },

  async getAllActive(): Promise<MenuItem[]> {
    const result = await query(
      'SELECT * FROM menu_items WHERE is_active = true ORDER BY item_type, order_index'
    );
    return result.rows as MenuItem[];
  },

  async getByType(type: 'menu' | 'cta'): Promise<MenuItem[]> {
    const result = await query(
      'SELECT * FROM menu_items WHERE item_type = $1 ORDER BY order_index',
      [type]
    );
    return result.rows as MenuItem[];
  },

  async getById(id: number): Promise<MenuItem | null> {
    const result = await query(
      'SELECT * FROM menu_items WHERE id = $1',
      [id]
    );
    return (result.rows[0] as MenuItem) || null;
  },

  async create(data: CreateMenuItemInput): Promise<MenuItem> {
    const result = await query(
      `INSERT INTO menu_items (label, url, page_slug, order_index, is_active, item_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.label,
        data.url,
        data.page_slug || null,
        data.order_index,
        data.is_active ?? true,
        data.item_type,
      ]
    );
    return result.rows[0] as MenuItem;
  },

  async update(id: number, data: UpdateMenuItemInput): Promise<MenuItem | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.label !== undefined) {
      updates.push(`label = $${paramIndex++}`);
      values.push(data.label);
    }
    if (data.url !== undefined) {
      updates.push(`url = $${paramIndex++}`);
      values.push(data.url);
    }
    if (data.page_slug !== undefined) {
      updates.push(`page_slug = $${paramIndex++}`);
      values.push(data.page_slug);
    }
    if (data.order_index !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      values.push(data.order_index);
    }
    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE menu_items SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return (result.rows[0] as MenuItem) || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM menu_items WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  },

  async reorder(items: Array<{ id: number; order_index: number }>): Promise<void> {
    for (const item of items) {
      await query(
        'UPDATE menu_items SET order_index = $1 WHERE id = $2',
        [item.order_index, item.id]
      );
    }
  },
};
