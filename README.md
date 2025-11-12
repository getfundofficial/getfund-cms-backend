# GETFund CMS Backend API

Express.js REST API for the GETFund Content Management System.

## Features

- ✅ JWT Authentication
- ✅ Role-based Access Control (Admin, Creator, Reviewer, Approver)
- ✅ Multi-stage Content Workflow
- ✅ Local File Upload
- ✅ Audit Logging
- ✅ PostgreSQL Database
- ✅ RESTful API Design

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local installation)
- npm or yarn

## Setup Instructions

### 1. Install PostgreSQL Locally

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings
- Default port: 5432
- Remember your postgres password

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE getfund_cms;

# Exit
\q
```

### 3. Install Dependencies

```bash
cd cms/backend
npm install
```

### 4. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and update these values:

```env
# Update with your PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/getfund_cms

# Generate secure secrets (or use these for development)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-too
```

### 5. Run Migrations

```bash
npm run migrate
```

This will create all necessary database tables.

### 6. Seed Database

```bash
npm run seed
```

This creates 5 initial users and migrates existing news articles.

**Default Login:**
- Email: `admin@getfund.gov.gh`
- Password: `getfund2025`

**All Users:**
| Email | Role | Password |
|-------|------|----------|
| admin@getfund.gov.gh | Admin | getfund2025 |
| creator1@getfund.gov.gh | Creator | getfund2025 |
| creator2@getfund.gov.gh | Creator | getfund2025 |
| reviewer@getfund.gov.gh | Reviewer | getfund2025 |
| approver@getfund.gov.gh | Approver | getfund2025 |

⚠️ **Change these passwords after first login!**

### 7. Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Content (Public)
- `GET /api/content/published` - Get all published content
- `GET /api/content/published/:slug` - Get single published content

### Content (Protected)
- `GET /api/content` - Get all content (role-filtered)
- `GET /api/content/:id` - Get single content
- `POST /api/content` - Create content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `GET /api/content/stats` - Get dashboard stats
- `GET /api/content/:id/revisions` - Get version history

### Workflow
- `POST /api/content/:id/submit` - Submit for review
- `POST /api/content/:id/approve` - Approve content
- `POST /api/content/:id/request-changes` - Request changes
- `POST /api/content/:id/publish` - Publish content
- `POST /api/content/:id/unpublish` - Unpublish content

### Media
- `GET /api/media` - List all media
- `POST /api/media/upload` - Upload file
- `PUT /api/media/:id` - Update alt text
- `DELETE /api/media/:id` - Delete media

### Users (Admin Only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Audit Logs
- `GET /api/audit` - Get audit logs
- `GET /api/audit/content/:id` - Get logs for specific content

## Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@getfund.gov.gh","password":"getfund2025"}'

# Get published content
curl http://localhost:5000/api/content/published?type=news
```

### Using Postman/Insomnia

1. Import the API endpoints
2. Login to get access token
3. Add token to Authorization header: `Bearer YOUR_TOKEN`

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, JWT, upload config
│   ├── middleware/      # Auth, permissions, error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── database/
│   │   ├── migrations/  # SQL migration files
│   │   └── seeds/       # Seed data
│   └── index.js         # App entry point
├── uploads/             # Local file storage
├── .env                 # Environment variables
└── package.json
```

## Migrating to Supabase

When you're ready to migrate to Supabase:

1. Create a Supabase project
2. Get your connection string from Supabase dashboard
3. Update `.env`:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
```

4. Run migrations and seed again:

```bash
npm run migrate
npm run seed
```

No code changes needed! The same codebase works with both local PostgreSQL and Supabase.

## Troubleshooting

### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** Make sure PostgreSQL is running:
```bash
# Windows: Check Services
# macOS: brew services list
# Linux: sudo systemctl status postgresql
```

### Migration Failed

```
Error: relation already exists
```

**Solution:** Drop and recreate the database:
```bash
psql -U postgres
DROP DATABASE getfund_cms;
CREATE DATABASE getfund_cms;
\q
npm run migrate
npm run seed
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Change PORT in `.env` or kill the process using port 5000

## Development Commands

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run migrate  # Run database migrations
npm run seed     # Seed database with initial data
```

## Security Notes

- JWT tokens expire after 1 day
- Refresh tokens expire after 7 days
- Passwords are hashed using bcrypt (10 rounds)
- Rate limiting: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- All sensitive actions are logged in audit_logs

## License

MIT
