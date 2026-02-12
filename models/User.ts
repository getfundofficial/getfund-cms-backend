import { query } from '@/lib/db';

// Granular permissions structure
export interface UserPermissions {
  navigation: {
    dashboard: boolean;
    news: boolean;
    pages: boolean;
    heroSlides: boolean;
    mediaLibrary: boolean;
    impactStats: boolean;
    campaigns: boolean;
    teamMembers: boolean;
    partners: boolean;
    reviewQueue: boolean;
    approvalQueue: boolean;
  };
  admin: {
    users: boolean;
    menuConfig: boolean;
    footerSettings: boolean;
    auditLogs: boolean;
    lotteryConfig: boolean;
    lotteryEntries: boolean;
    pledges: boolean;
    donations: boolean;
  };
  actions: {
    canPublish: boolean;
    canReview: boolean;
    canDelete: boolean;
  };
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    navigation: {
      dashboard: true, news: true, pages: true, heroSlides: true,
      mediaLibrary: true, impactStats: true, campaigns: true, teamMembers: true,
      partners: true, reviewQueue: true, approvalQueue: true
    },
    admin: {
      users: true, menuConfig: true, footerSettings: true, auditLogs: true,
      lotteryConfig: true, lotteryEntries: true, pledges: true, donations: true
    },
    actions: { canPublish: true, canReview: true, canDelete: true }
  },
  restricted_admin: {
    navigation: {
      dashboard: true, news: true, pages: true, heroSlides: true,
      mediaLibrary: true, impactStats: true, campaigns: true, teamMembers: true,
      partners: true, reviewQueue: true, approvalQueue: true
    },
    admin: {
      users: false, menuConfig: true, footerSettings: true, auditLogs: true,
      lotteryConfig: true, lotteryEntries: true, pledges: true, donations: true
    },
    actions: { canPublish: true, canReview: true, canDelete: true }
  },
  creator: {
    navigation: {
      dashboard: true, news: true, pages: true, heroSlides: true,
      mediaLibrary: true, impactStats: true, campaigns: true, teamMembers: true,
      partners: true, reviewQueue: false, approvalQueue: false
    },
    admin: {
      users: false, menuConfig: false, footerSettings: false, auditLogs: false,
      lotteryConfig: false, lotteryEntries: false, pledges: false, donations: false
    },
    actions: { canPublish: false, canReview: false, canDelete: false }
  },
  reviewer: {
    navigation: {
      dashboard: true, news: true, pages: true, heroSlides: true,
      mediaLibrary: true, impactStats: true, campaigns: true, teamMembers: true,
      partners: true, reviewQueue: true, approvalQueue: false
    },
    admin: {
      users: false, menuConfig: false, footerSettings: false, auditLogs: false,
      lotteryConfig: false, lotteryEntries: false, pledges: false, donations: false
    },
    actions: { canPublish: false, canReview: true, canDelete: false }
  },
  approver: {
    navigation: {
      dashboard: true, news: true, pages: true, heroSlides: true,
      mediaLibrary: true, impactStats: true, campaigns: true, teamMembers: true,
      partners: true, reviewQueue: false, approvalQueue: true
    },
    admin: {
      users: false, menuConfig: false, footerSettings: false, auditLogs: false,
      lotteryConfig: false, lotteryEntries: false, pledges: false, donations: false
    },
    actions: { canPublish: true, canReview: false, canDelete: false }
  }
};

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  password_hash?: string;
  is_active: boolean;
  permissions?: UserPermissions;
  created_at: Date;
  updated_at?: Date;
}

export class UserModel {
  // Find user by email (includes password for auth)
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return (result.rows[0] as User) || null;
  }

  // Find user by ID (without password)
  static async findById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const result = await query(
      'SELECT id, email, full_name, role, is_active, permissions, created_at FROM users WHERE id = $1',
      [id]
    );
    return (result.rows[0] as Omit<User, 'password_hash'>) || null;
  }

  // Get all users
  static async getAll(): Promise<Omit<User, 'password_hash'>[]> {
    const result = await query(
      'SELECT id, email, full_name, role, is_active, permissions, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows as Omit<User, 'password_hash'>[];
  }

  // Create new user
  static async create(userData: {
    email: string;
    password_hash: string;
    full_name: string;
    role: string;
    permissions?: UserPermissions;
  }): Promise<Omit<User, 'password_hash'>> {
    // Use provided permissions or default based on role
    const permissions = userData.permissions || DEFAULT_PERMISSIONS[userData.role] || DEFAULT_PERMISSIONS.creator;

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, permissions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, permissions, is_active, created_at`,
      [userData.email, userData.password_hash, userData.full_name, userData.role, JSON.stringify(permissions)]
    );
    return result.rows[0] as Omit<User, 'password_hash'>;
  }

  // Update user
  static async update(
    id: string,
    updates: Partial<Pick<User, 'email' | 'full_name' | 'role' | 'is_active' | 'permissions'>>
  ): Promise<Omit<User, 'password_hash'>> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.full_name !== undefined) {
      fields.push(`full_name = $${paramIndex++}`);
      values.push(updates.full_name);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(updates.role);
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(updates.is_active);
    }
    if (updates.permissions !== undefined) {
      fields.push(`permissions = $${paramIndex++}`);
      values.push(JSON.stringify(updates.permissions));
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, full_name, role, is_active, permissions, updated_at`,
      values
    );
    return result.rows[0] as Omit<User, 'password_hash'>;
  }

  // Deactivate user
  static async deactivate(id: string): Promise<void> {
    await query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );
  }
}
