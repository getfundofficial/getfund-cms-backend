import { query } from '@/lib/db';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
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
}
