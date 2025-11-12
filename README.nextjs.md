# GETFund CMS Backend - Next.js

This is the Next.js backend API for the GETFund CMS, configured for deployment on Vercel with Neon Postgres.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file based on `.env.nextjs.example`:
```bash
cp .env.nextjs.example .env.local
```

Update the following variables:
- `DATABASE_URL`: Your Neon Postgres connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `JWT_REFRESH_SECRET`: Another secure random string for refresh tokens
- `FRONTEND_URL`: Your frontend URL (for CORS)

3. Run database migrations:
```bash
npm run migrate
```

4. Seed the database (optional):
```bash
npm run seed
```

## Development

Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Content
- `GET /api/content` - List content
- `POST /api/content` - Create content
- `GET /api/content/[id]` - Get content by ID
- `PUT /api/content/[id]` - Update content
- `DELETE /api/content/[id]` - Delete content

### Media
- `GET /api/media` - List media
- `POST /api/media` - Upload media
- `DELETE /api/media/[id]` - Delete media

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Deactivate user

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL`

### Neon Database

1. Create a new Neon project at https://neon.tech
2. Copy the connection string
3. Update `DATABASE_URL` in your environment variables
4. Run migrations

## Migration from Express

This backend has been converted from Express.js to Next.js for better Vercel compatibility and serverless deployment. The API routes remain compatible with the existing frontend.

### Key Changes:
- Express routes → Next.js API routes (`app/api/*`)
- Traditional database pool → Neon serverless driver
- Express middleware → Next.js middleware and route handlers
- CommonJS → ES Modules + TypeScript
