import { query } from '@/lib/db';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface AuditLogFilters {
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  action?: string;
  sort?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class AuditLogModel {
  static async create(data: {
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    changes?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<AuditLogEntry> {
    const result = await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.user_id,
        data.action,
        data.entity_type,
        data.entity_id,
        data.changes ? JSON.stringify(data.changes) : null,
        data.ip_address,
        data.user_agent,
      ]
    );
    return result.rows[0] as AuditLogEntry;
  }

  static async getAll(filters: AuditLogFilters = {}): Promise<{ logs: AuditLogEntry[]; total: number }> {
    const {
      user_id,
      entity_type,
      entity_id,
      action,
      sort = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (user_id) {
      conditions.push(`al.user_id = $${paramCount++}`);
      params.push(user_id);
    }

    if (entity_type) {
      conditions.push(`al.entity_type = $${paramCount++}`);
      params.push(entity_type);
    }

    if (entity_id) {
      conditions.push(`al.entity_id = $${paramCount++}`);
      params.push(entity_id);
    }

    if (action) {
      conditions.push(`al.action = $${paramCount++}`);
      params.push(action);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated logs with user information
    const orderDirection = sort === 'asc' ? 'ASC' : 'DESC';
    params.push(limit, offset);
    const logsResult = await query(
      `SELECT
        al.*,
        u.full_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at ${orderDirection}
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      params
    );

    return {
      logs: logsResult.rows as AuditLogEntry[],
      total,
    };
  }

  static async getByEntity(entityType: string, entityId: string, limit = 50): Promise<AuditLogEntry[]> {
    const result = await query(
      `SELECT
        al.*,
        u.full_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = $1 AND al.entity_id = $2
       ORDER BY al.created_at DESC
       LIMIT $3`,
      [entityType, entityId, limit]
    );
    return result.rows as AuditLogEntry[];
  }

  static async getByUser(userId: string, limit = 50, offset = 0): Promise<{ logs: AuditLogEntry[]; total: number }> {
    const countResult = await query(
      'SELECT COUNT(*) as total FROM audit_logs WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await query(
      `SELECT
        al.*,
        u.full_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.user_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      logs: result.rows as AuditLogEntry[],
      total,
    };
  }

  static async getRecent(limit = 20): Promise<AuditLogEntry[]> {
    const result = await query(
      `SELECT
        al.*,
        u.full_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows as AuditLogEntry[];
  }
}
