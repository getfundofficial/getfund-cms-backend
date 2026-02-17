import { query } from '@/lib/db';

export interface PasswordResetRequest {
  id: string;
  user_id: string;
  user_email?: string;
  user_full_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: Date;
  resolved_at: Date | null;
  resolved_by: string | null;
  notes: string | null;
}

export class PasswordResetRequestModel {
  static async create(userId: string): Promise<PasswordResetRequest> {
    const result = await query(
      `INSERT INTO password_reset_requests (user_id)
       VALUES ($1)
       RETURNING *`,
      [userId]
    );
    return result.rows[0] as PasswordResetRequest;
  }

  static async findPendingByUserId(userId: string): Promise<PasswordResetRequest | null> {
    const result = await query(
      `SELECT * FROM password_reset_requests
       WHERE user_id = $1 AND status = 'pending'
       LIMIT 1`,
      [userId]
    );
    return (result.rows[0] as PasswordResetRequest) || null;
  }

  static async getAllPending(): Promise<PasswordResetRequest[]> {
    const result = await query(
      `SELECT prr.*, u.email AS user_email, u.full_name AS user_full_name
       FROM password_reset_requests prr
       JOIN users u ON prr.user_id = u.id
       WHERE prr.status = 'pending'
       ORDER BY prr.requested_at ASC`
    );
    return result.rows as PasswordResetRequest[];
  }

  static async findById(id: string): Promise<PasswordResetRequest | null> {
    const result = await query(
      `SELECT prr.*, u.email AS user_email, u.full_name AS user_full_name
       FROM password_reset_requests prr
       JOIN users u ON prr.user_id = u.id
       WHERE prr.id = $1`,
      [id]
    );
    return (result.rows[0] as PasswordResetRequest) || null;
  }

  static async approve(id: string, resolvedBy: string): Promise<PasswordResetRequest> {
    const result = await query(
      `UPDATE password_reset_requests
       SET status = 'approved', resolved_at = NOW(), resolved_by = $2
       WHERE id = $1
       RETURNING *`,
      [id, resolvedBy]
    );
    return result.rows[0] as PasswordResetRequest;
  }

  static async countPending(): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count FROM password_reset_requests WHERE status = 'pending'`
    );
    return parseInt(result.rows[0].count, 10);
  }

  static async reject(id: string, resolvedBy: string, notes?: string): Promise<PasswordResetRequest> {
    const result = await query(
      `UPDATE password_reset_requests
       SET status = 'rejected', resolved_at = NOW(), resolved_by = $2, notes = $3
       WHERE id = $1
       RETURNING *`,
      [id, resolvedBy, notes || null]
    );
    return result.rows[0] as PasswordResetRequest;
  }
}
