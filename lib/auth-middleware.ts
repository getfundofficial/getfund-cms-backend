import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from './jwt';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

// Supabase JWT token structure
interface SupabaseToken {
  sub: string;
  email?: string;
  role?: string;
  user_metadata?: {
    role?: string;
  };
  app_metadata?: {
    role?: string;
  };
}

export async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, user: null };
    }

    const token = authHeader.substring(7);

    // First try to verify with CMS JWT secret
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as DecodedToken;

      return {
        authenticated: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions || []
        }
      };
    } catch (cmsError) {
      // CMS JWT verification failed, try Supabase JWT
    }

    // Try to verify with Supabase JWT secret
    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (supabaseJwtSecret) {
      try {
        const decoded = jwt.verify(token, supabaseJwtSecret) as SupabaseToken;

        // Extract role from Supabase token (check multiple locations)
        const role = decoded.role ||
                     decoded.user_metadata?.role ||
                     decoded.app_metadata?.role ||
                     'admin'; // Default to admin for authenticated Supabase users

        return {
          authenticated: true,
          user: {
            id: decoded.sub,
            email: decoded.email || '',
            role: role,
            permissions: []
          }
        };
      } catch (supabaseError) {
        // Supabase JWT verification also failed
      }
    }

    return { authenticated: false, user: null };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}

export function checkPermission(user: any, requiredPermission: string): boolean {
  if (!user || !user.permissions) {
    return false;
  }
  return user.permissions.includes(requiredPermission) || user.role === 'admin';
}
