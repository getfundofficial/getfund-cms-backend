# 🚀 Vercel Deployment - Interactive Steps

## Run this command and follow the prompts:

```bash
cd backend
vercel --prod
```

## Answer the prompts as follows:

### 1. Set up and deploy?
**Answer:** `yes`

### 2. Which scope should contain your project?
**Answer:** Select `thehansguy` (NOT getfundofficial)

### 3. Link to existing project?
**Answer:** `no` (create a new project)

### 4. What's the name of your new project?
**Suggested:** `getfund-cms-api` or `getfund-backend`

### 5. In which directory is your code located?
**Answer:** `./` (current directory - should auto-detect)

---

## After Deployment Completes:

You'll see output like:
```
✓ Production: https://getfund-cms-api.vercel.app [2m]
```

**Save this URL!** You'll need it for:
1. Frontend configuration
2. CORS settings
3. API testing

---

## Next Step: Add Environment Variables

1. Go to: https://vercel.com/thehansguy/your-project-name/settings/environment-variables

2. Add these variables (copy from `DEPLOY_NOW.md`):
   - DATABASE_URL
   - POSTGRES_URL
   - POSTGRES_URL_NON_POOLING
   - POSTGRES_PRISMA_URL
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - JWT_EXPIRE
   - JWT_REFRESH_EXPIRE
   - NODE_ENV
   - ADMIN_DASHBOARD_URL (update after frontend deployment)
   - PUBLIC_WEBSITE_URL (update after frontend deployment)

3. **Redeploy** after adding env vars:
   ```bash
   vercel --prod
   ```

---

## Ready to deploy now!

Run: `cd backend && vercel --prod`
