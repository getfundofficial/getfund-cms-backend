export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  expiresIn: process.env.JWT_EXPIRE || '1d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',

  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }
};
