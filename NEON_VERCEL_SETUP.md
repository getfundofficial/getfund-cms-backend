# Neon Database + Vercel Deployment Setup

## ✅ Local Setup Complete

Your local `.env` file has been updated with Neon database credentials. The database connection is now configured and ready to use.

## 📋 Vercel Environment Variables Setup

To deploy to Vercel, you need to add these environment variables in your Vercel project dashboard:

### Step 1: Go to Vercel Project Settings
1. Navigate to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** → **Environment Variables**

### Step 2: Add Database Environment Variables

Add the following variables (use the **Production**, **Preview**, and **Development** environments as needed):

#### Required Variables:

```bash
# Primary database connection (with connection pooling)
DATABASE_URL=postgresql://neondb_owner:npg_cMqoV3tZh1TK@ep-autumn-fog-ahhqdw0v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# Vercel Postgres URL (same as DATABASE_URL)
POSTGRES_URL=postgresql://neondb_owner:npg_cMqoV3tZh1TK@ep-autumn-fog-ahhqdw0v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# Non-pooling connection (for direct connections)
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_cMqoV3tZh1TK@ep-autumn-fog-ahhqdw0v.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# Prisma URL with connection timeout
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_cMqoV3tZh1TK@ep-autumn-fog-ahhqdw0v-pooler.c-3.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
```

#### JWT Secrets (Generate secure values for production):

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-too
```

### Step 3: Additional Environment Variables (Optional)

```bash
# Frontend URLs for CORS
PUBLIC_WEBSITE_URL=https://your-production-website.com
ADMIN_DASHBOARD_URL=https://your-admin-dashboard.com

# JWT Configuration
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Navigate to backend directory
cd backend

# Deploy
vercel --prod
```

### Option 2: Deploy via Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push to main branch

## 🔧 Database Configuration Details

### Connection Types:

1. **DATABASE_URL** (Pooled): 
   - Uses PgBouncer connection pooling
   - Recommended for most API routes
   - Better performance for serverless functions

2. **DATABASE_URL_UNPOOLED**: 
   - Direct connection without pooling
   - Use for database migrations
   - Required for certain PostgreSQL features

3. **POSTGRES_PRISMA_URL**: 
   - Optimized for Prisma ORM
   - Includes connection timeout settings
   - Use if you migrate to Prisma

### Updated Database Driver:

The `lib/db.ts` has been updated to use:
- **@neondatabase/serverless**: Optimized for Vercel serverless functions
- **@vercel/postgres**: Connection pooling support
- Both drivers are already installed in your `package.json`

## ✨ Features of New Setup

1. **Serverless-optimized**: Uses Neon's serverless driver for better cold start performance
2. **Connection pooling**: Utilizes PgBouncer for efficient connection management
3. **SSL enabled**: Secure connections with `sslmode=require`
4. **Transaction support**: Maintains transaction functionality for complex operations
5. **Error handling**: Improved error logging and handling

## 🧪 Testing the Connection

After setup, test the database connection:

```bash
# Install dependencies (if needed)
npm install

# Test locally
npm run dev

# Test a database operation
curl http://localhost:5000/api/health
```

## 📝 Notes

- **Security**: The credentials in this setup are for your Neon database. Keep them secure.
- **Environment**: The `.env` file is already in `.gitignore` to prevent committing sensitive data.
- **Production JWT Secrets**: Generate strong, unique JWT secrets for production using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## 🔗 Useful Links

- [Neon Documentation](https://neon.tech/docs/introduction)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Integration](https://vercel.com/docs/storage/vercel-postgres)
- [@neondatabase/serverless](https://github.com/neondatabase/serverless)

## 🆘 Troubleshooting

### Connection Errors:
1. Verify environment variables are set correctly in Vercel
2. Check that SSL mode is enabled (`sslmode=require`)
3. Ensure Neon database is active (free tier has auto-pause)

### Cold Start Performance:
- Neon serverless driver is optimized for cold starts
- Connection pooling helps reduce latency
- Consider upgrading Neon plan for better performance

### Migration Issues:
- Use `DATABASE_URL_UNPOOLED` for running migrations
- Some PostgreSQL features require direct connections

---

**Status**: ✅ Neon database connection configured and ready for deployment!
