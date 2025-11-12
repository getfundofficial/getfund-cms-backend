import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from './jwt';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, user: null };
    }

    const token = authHeader.substring(7);
    
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
    } catch (error) {
      return { authenticated: false, user: null };
    }
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
