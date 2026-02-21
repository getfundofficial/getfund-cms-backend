import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon>;
function sql(strings: TemplateStringsArray, ...values: any[]): Promise<Record<string, any>[]> {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql(strings, ...values) as Promise<Record<string, any>[]>;
}

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
    // Get existing member first
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Team member not found');
    }

    // Merge with existing data
    const name = data.name !== undefined ? data.name : existing.name;
    const title = data.title !== undefined ? data.title : existing.title;
    const role = data.role !== undefined ? data.role : existing.role;
    const image_url = data.image_url !== undefined ? data.image_url : existing.image_url;
    const bio = data.bio !== undefined ? data.bio : existing.bio;
    const date_range = data.date_range !== undefined ? data.date_range : existing.date_range;
    const display_order = data.display_order !== undefined ? data.display_order : existing.display_order;
    const status = data.status !== undefined ? data.status : existing.status;

    const result = await sql`
      UPDATE team_members
      SET
        name = ${name},
        title = ${title},
        role = ${role},
        image_url = ${image_url || null},
        bio = ${bio || null},
        date_range = ${date_range || null},
        display_order = ${display_order},
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;
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
