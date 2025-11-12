# 🚀 Ready to Deploy to Vercel

## ✅ Pre-deployment Setup Complete

### What Was Done:
1. ✅ Updated CORS configuration to support production URLs
2. ✅ Created centralized CORS helper (`lib/cors.ts`)
3. ✅ Updated all auth API routes to use CORS helper
4. ✅ Generated secure production JWT secrets
5. ✅ Configured cookies for production (SameSite=none, Secure)

---

## 🔐 Environment Variables for Vercel

Copy these into your Vercel project dashboard:

### Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

```bash
# Database (Already configured with Neon)
DATABASE_URL=postgresql://neondb_owner:npg_cMqoV3tZh1TK@ep-autumn-fog-ahhqdw0v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_URL=postgresql://neondb_owner:npg_cMqoV3tZh1TK@ep-autumn-fog-ahhqdw0v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_cMqoV3tZh1TK@ep-autumn-fog-ahhqdw0v.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_cMqoV3tZh1TK@ep-autumn-fog-ahhqdw0v-pooler.c-3.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require

# JWT Secrets (PRODUCTION - SECURE)
JWT_SECRET=756450a09da30e686123f82844ac8d67c8b81ef035125de00f68661217ed6f44

JWT_REFRESH_SECRET=3ca71c30b3130cdd4109ca824a0844c4ffa45dba9666f7b72cf9ec7c538dc85c

# JWT Expiry
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d

# Node Environment
NODE_ENV=production

# Frontend URLs (Update after deploying frontend)
ADMIN_DASHBOARD_URL=https://your-frontend-dashboard.vercel.app
PUBLIC_WEBSITE_URL=https://your-public-website.vercel.app

# File Upload
MAX_FILE_SIZE=5242880
```

**Important:** Apply these to:
- ✅ Production
- ✅ Preview
- ✅ Development (optional)

---

## 📦 Deploy Backend to Vercel

### Option 1: Using Vercel CLI (Recommended)

```bash
# Navigate to backend directory
cd backend

# Login to Vercel (if not already logged in)
vercel login

# Deploy to production
vercel --prod

# When prompted:
# - Select scope: thehansguy
# - Link to existing project: no (create new)
# - Project name: getfund-cms-api
```

### Option 2: Using Git Integration

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure Neon database and CORS for production"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Set **Root Directory** to `backend`
   - Add environment variables (from above)
   - Click "Deploy"

---

## 🎯 After Deployment

### 1. Note Your API URL
After deployment, you'll get a URL like:
```
https://getfund-cms-backend-xxxxx.vercel.app
```

### 2. Update Frontend to Use Production API

**Frontend `.env.production`:**
```bash
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### 3. Update CORS Origins in Backend

After deploying your frontend, update `backend/.env` (or Vercel env vars):
```bash
ADMIN_DASHBOARD_URL=https://your-actual-frontend.vercel.app
PUBLIC_WEBSITE_URL=https://your-actual-website.vercel.app
```

Then **redeploy** the backend so it accepts requests from your frontend.

---

## 🧪 Test Your Deployed API

### Test Health Check (if you have one)
```bash
curl https://your-backend-url.vercel.app/api/health
```

### Test Login Endpoint
```bash
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@getfund.gov.gh","password":"getfund2025"}'
```

Expected response:
```json
{
  "user": { ... },
  "accessToken": "eyJhbG..."
}
```

---

## 🔄 CI/CD Setup (Optional)

### Auto-deploy on Git Push

If using Git integration, Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for PR branches
- ✅ Runs `npm run build` automatically
- ✅ Injects environment variables

### Manual Deployment

You can always deploy manually:
```bash
vercel --prod
```

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Environment variables added in Vercel
- [ ] API URL noted for frontend configuration
- [ ] Test login endpoint works
- [ ] Test auth/me endpoint with token
- [ ] Frontend updated with production API URL
- [ ] Frontend deployed
- [ ] CORS origins updated with actual frontend URL
- [ ] Backend redeployed with updated CORS
- [ ] End-to-end test: Login from frontend to backend

---

## 🆘 Troubleshooting

### CORS Errors
**Problem:** Frontend can't connect to API

**Solution:**
1. Add your frontend URL to environment variables:
   ```bash
   ADMIN_DASHBOARD_URL=https://your-frontend.vercel.app
   ```
2. Redeploy backend

### Database Connection Errors
**Problem:** "Database connection failed"

**Solution:**
1. Verify `DATABASE_URL` is set in Vercel
2. Check Neon database is active (free tier auto-pauses)
3. Verify SSL mode is `require`
4. Redeploy after adding env vars

### JWT Token Errors
**Problem:** "Invalid token" or "jwt malformed"

**Solution:**
1. Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
2. Ensure secrets are the same across deployments
3. Clear cookies and login again

### Build Errors
**Problem:** Build fails on Vercel

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript compiles locally: `npm run build`

---

## 📚 Next Steps

1. **Deploy the Backend** (see commands above)
2. **Configure Environment Variables** in Vercel dashboard
3. **Test the API** with curl or Postman
4. **Deploy the Frontend** (separate deployment)
5. **Update CORS** with actual frontend URL
6. **Test End-to-End** from frontend to backend

---

## 🎉 Quick Deploy Command

```bash
cd backend
vercel --prod
```

**That's it!** Your API will be live in ~2 minutes! 🚀
