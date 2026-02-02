import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: 'board_chairman' | 'board_member' | 'management' | 'historical_admin' | 'deputy_administrator' | 'financial_controller';
  image_url?: string;
  bio?: string;
  date_range?: string;
  display_order: number;
  status: 'active' | 'inactive';
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateTeamMemberInput {
  name: string;
  title: string;
  role: TeamMember['role'];
  image_url?: string;
  bio?: string;
  date_range?: string;
  display_order?: number;
  status?: 'active' | 'inactive';
  created_by?: string;
}

export interface UpdateTeamMemberInput {
  name?: string;
  title?: string;
  role?: TeamMember['role'];
  image_url?: string;
  bio?: string;
  date_range?: string;
  display_order?: number;
  status?: 'active' | 'inactive';
}

class TeamMemberModel {
  /**
   * Get all team members, optionally filtered by role
   */
  async getAll(role?: string): Promise<TeamMember[]> {
    if (role) {
      const result = await sql`
        SELECT * FROM team_members
        WHERE role = ${role} AND deleted_at IS NULL
        ORDER BY display_order ASC, created_at DESC
      `;
      return result as TeamMember[];
    }
    const result = await sql`
      SELECT * FROM team_members
      WHERE deleted_at IS NULL
      ORDER BY display_order ASC, created_at DESC
    `;
    return result as TeamMember[];
  }

  /**
   * Get active team members by role
   */
  async getActiveByRole(role: TeamMember['role']): Promise<TeamMember[]> {
    const result = await sql`
      SELECT * FROM team_members
      WHERE role = ${role} AND status = 'active' AND deleted_at IS NULL
      ORDER BY display_order ASC
    `;
    return result as TeamMember[];
  }

  /**
   * Get board chairman
   */
  async getBoardChairman(): Promise<TeamMember | null> {
    const result = await sql`
      SELECT * FROM team_members
      WHERE role = 'board_chairman' AND status = 'active' AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return (result[0] as TeamMember) || null;
  }

  /**
   * Get management team members
   */
  async getManagementTeam(): Promise<TeamMember[]> {
    return await this.getActiveByRole('management');
  }

  /**
   * Get historical administrators
   */
  async getHistoricalAdmins(): Promise<TeamMember[]> {
    return await this.getActiveByRole('historical_admin');
  }

  /**
   * Get deputy administrator
   */
  async getDeputyAdministrator(): Promise<TeamMember | null> {
    const result = await sql`
      SELECT * FROM team_members
      WHERE role = 'deputy_administrator' AND status = 'active' AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return (result[0] as TeamMember) || null;
  }

  /**
   * Get financial controller
   */
  async getFinancialController(): Promise<TeamMember | null> {
    const result = await sql`
      SELECT * FROM team_members
      WHERE role = 'financial_controller' AND status = 'active' AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return (result[0] as TeamMember) || null;
  }

  /**
   * Get a single team member by ID
   */
  async getById(id: string): Promise<TeamMember | null> {
    const result = await sql`
      SELECT * FROM team_members
      WHERE id = ${id} AND deleted_at IS NULL
    `;
    return (result[0] as TeamMember) || null;
  }

  /**
   * Create a new team member
   */
  async create(data: CreateTeamMemberInput): Promise<TeamMember> {
    const result = await sql`
      INSERT INTO team_members (
        name, title, role, image_url, bio, date_range, display_order, status, created_by
      )
      VALUES (
        ${data.name},
        ${data.title},
        ${data.role},
        ${data.image_url || null},
        ${data.bio || null},
        ${data.date_range || null},
        ${data.display_order || 0},
        ${data.status || 'active'},
        ${data.created_by || null}
      )
      RETURNING *
    `;
    return result[0] as TeamMember;
  }

  /**
   * Update a team member
   */
  async update(id: string, data: UpdateTeamMemberInput): Promise<TeamMember> {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(data.role);
    }
    if (data.image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      values.push(data.image_url);
    }
    if (data.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(data.bio);
    }
    if (data.date_range !== undefined) {
      updates.push(`date_range = $${paramIndex++}`);
      values.push(data.date_range);
    }
    if (data.display_order !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      values.push(data.display_order);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE team_members
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await sql(query, values);
    return result[0] as TeamMember;
  }

  /**
   * Soft delete a team member
   */
  async delete(id: string): Promise<void> {
    await sql`
      UPDATE team_members
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  }

  /**
   * Hard delete a team member (use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    await sql`
      DELETE FROM team_members
      WHERE id = ${id}
    `;
  }
}

export default new TeamMemberModel();
