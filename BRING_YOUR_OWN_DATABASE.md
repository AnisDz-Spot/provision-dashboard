# Bring Your Own Database (BYO) Architecture

## Overview

This application now uses a **Bring Your Own Database** (BYO) model where each user connects their own PostgreSQL database. This eliminates the complexity of Supabase setup and puts users in control of their database costs.

**Key Principle:** Users pay their database provider directly, not the application.

---

## User Journey

```
1. User registers email/password (Supabase auth only)
   ↓
2. Redirected to /auth/setup-database
   ↓
3. User chooses PostgreSQL provider:
   • Neon (easiest, recommended)
   • Railway
   • Render
   • AWS RDS
   • Any PostgreSQL
   ↓
4. User creates database in chosen provider (5 minutes)
   ↓
5. User copies connection string
   ↓
6. User enters connection string in setup page
   ↓
7. System validates and encrypts connection string
   ↓
8. User runs provided SQL schema in database console
   ↓
9. User completes optional 2FA setup
   ↓
10. Dashboard ready! All data in user's own database
```

---

## Architecture

### Authentication vs Data Storage

**Supabase (Auth only):**
- User signup/login
- Password management
- Session tokens
- 2FA (optional)

**User's PostgreSQL (Data only):**
- Projects, tasks, team members
- All application data
- User controls database size/location
- User controls backups

### Encryption

Connection strings are encrypted using AES-256-GCM:
- **Key**: `SUPABASE_KEYS_ENCRYPTION_KEY` environment variable
- **Storage**: `data/user-database-connections.json` (dev) or database (production)
- **Retrieval**: Decrypted on-demand when needed

### Data Flow

```
User Request
    ↓
API Route (authenticated user)
    ↓
Get user ID from Supabase auth
    ↓
Retrieve encrypted connection string
    ↓
Decrypt connection string
    ↓
Create PostgreSQL connection pool
    ↓
Execute query with user_id filter
    ↓
Return user's data only
```

---

## Code Architecture

### Files Created

**`lib/database/user-connection.ts`**
- `saveUserDatabaseConnection(userId, connectionString)` - Encrypt and save
- `getUserDatabaseConnection(userId)` - Decrypt and retrieve
- `hasUserDatabaseConnection(userId)` - Check if configured
- `getUserDatabasePool(userId)` - Get connection pool
- `queryUserDatabase(userId, sql, params)` - Execute query
- `getUserDatabaseClient(userId)` - Get single client connection

**`app/auth/setup-database/page.tsx`**
- 4-step onboarding: info → connection → schema → success
- Shows recommended providers with links
- Tests connection before proceeding
- Displays SQL schema to create
- Copy-to-clipboard functionality

**`app/api/user/database-connection/route.ts`**
- `GET` - Check if user has database configured
- `POST` - Save encrypted connection string
- Validates connection before saving

### Updated Files

**API Routes** (use PostgreSQL instead of Supabase):
- `app/api/projects/route.ts` - GET/POST projects
- `app/api/tasks/route.ts` - GET/POST tasks
- `app/api/team/route.ts` - GET/POST team members

**Pages**:
- `app/(auth)/register/page.tsx` - Redirects to setup-database after signup
- `app/dashboard/page.tsx` - Removed Supabase modals

---

## Database Schema

Users create these tables in their own PostgreSQL database:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10, 2),
  status TEXT DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  spent DECIMAL(10, 2) DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'Developer',
  workload INT DEFAULT 0,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_team_user ON team_members(user_id);
```

**Provided on setup page** - Users copy/paste into their database console.

---

## API Route Pattern

All data routes follow this pattern:

```typescript
export async function GET(request: NextRequest) {
  // 1. Get authenticated user
  const user = await getUser();
  if (!user) return Unauthorized;

  // 2. Get user's database pool
  const pool = await getUserDatabasePool(user.id);
  if (!pool) return DatabaseNotConfigured;

  // 3. Query with user_id filter (data isolation)
  const result = await pool.query(
    "SELECT * FROM projects WHERE user_id = $1",
    [user.id]
  );
  
  // 4. Return results
  return NextResponse.json({ projects: result.rows });
}
```

**Key Points:**
- Always filter by `user_id` for data isolation
- User can only see their own data
- No RLS policies needed (simple SQL filtering)
- Connection pooling for efficiency

---

## Data Isolation & Security

### Per-User Data Isolation

All queries include `WHERE user_id = $1`:
```sql
-- User only sees their projects
SELECT * FROM projects WHERE user_id = $1;
-- User can only insert their own data
INSERT INTO projects (user_id, ...) VALUES ($1, ...);
```

### No Cross-User Data Leakage

- Each user's connection string is separate
- Malicious user can't access another user's database
- Maximum security boundary

### Encryption at Rest

- Connection strings encrypted with AES-256-GCM
- IV and auth tag included
- Different key per environment

---

## Recommended Providers

### 1. **Neon** (BEST CHOICE) ⭐

```
✅ Easiest setup (2 clicks)
✅ Free tier included (0.5GB)
✅ Serverless PostgreSQL
✅ Auto-scaling
✅ Connection pooling built-in
✅ $0.30/hour compute

Sign up: https://neon.tech
```

**Setup Steps:**
1. Create account at neon.tech
2. Create new project (PostgreSQL 16)
3. Copy connection string
4. Paste into setup page
5. Run SQL schema

### 2. **Railway**

```
✅ Simple deployment
✅ Free tier + usage-based
✅ Good for learning

Sign up: https://railway.app
```

### 3. **Render**

```
✅ Free tier available
✅ PostgreSQL included
✅ Easy to scale

Sign up: https://render.com
```

### 4. **AWS RDS**

```
✅ Enterprise-grade
✅ Full control
✅ Expensive ($$ per month)

Sign up: https://aws.amazon.com/rds/
```

---

## Setup Page Flow

### Step 1: Information
- Explains benefits of BYO database
- Lists recommended providers with links
- User clicks "I Have My Connection String"

### Step 2: Connection String
- User enters their PostgreSQL connection string
- Format: `postgresql://user:password@host:5432/database`
- System tests connection
- Shows error if invalid

### Step 3: Schema
- Displays SQL schema to create tables
- User copies SQL
- User runs in database console
- User confirms "I've Created the Tables"

### Step 4: Success
- Confirms setup complete
- Options:
  - Continue to 2FA setup
  - Skip to dashboard immediately

---

## Environment Variables

### Required

**`SUPABASE_KEYS_ENCRYPTION_KEY`**
- Purpose: Encrypt/decrypt connection strings
- Value: Any string (will be SHA-256 hashed if not 32 bytes)
- Example: `your-secret-key-12345`

### Optional

**Global Supabase** (for auth only):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

Only used for user authentication, not data.

---

## API Endpoints

### GET `/api/user/database-connection`
**Check if user has database configured**

```bash
curl http://localhost:3000/api/user/database-connection \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "connected": true
}
```

---

### POST `/api/user/database-connection`
**Save database connection string**

```bash
curl -X POST http://localhost:3000/api/user/database-connection \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"connectionString":"postgresql://user:pass@host/db"}'
```

Response:
```json
{
  "success": true
}
```

---

### GET `/api/projects`
**Fetch user's projects from their database**

```bash
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "projects": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Project",
      "status": "planning",
      ...
    }
  ]
}
```

---

### POST `/api/projects`
**Create project in user's database**

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "budget": 5000,
    "status": "planning"
  }'
```

---

## Testing the Implementation

### 1. Register Account

```bash
# Go to http://localhost:3000/register
# Create account with email/password
```

### 2. Get Connection String

```bash
# Go to https://neon.tech
# Create free PostgreSQL project
# Copy connection string from dashboard
```

### 3. Setup Database

```bash
# Redirected to /auth/setup-database
# Enter connection string
# Copy/paste SQL schema
# Run SQL in Neon console
# Continue
```

### 4. Use Dashboard

```bash
# Go to /dashboard
# Create projects, tasks, team members
# All data stored in YOUR PostgreSQL database
```

### 5. Verify Data

```sql
-- In your database console, verify data exists:
SELECT * FROM projects;
SELECT * FROM tasks;
SELECT * FROM team_members;
```

---

## Troubleshooting

### "Invalid connection string"

**Problem:** Connection string format is wrong

**Solution:**
- Format: `postgresql://user:password@host:5432/database`
- Check for typos
- Verify host is correct
- Ensure password doesn't have special characters (URL encode if needed)

---

### "Connection failed"

**Problem:** Can't connect to database

**Solution:**
1. Verify database is running
2. Check network connectivity
3. Verify credentials
4. Check if firewall allows connections
5. Enable public access if using cloud provider

---

### "Table doesn't exist"

**Problem:** Ran setup page but didn't create tables

**Solution:**
1. Go to your database console (Neon/Railway/etc)
2. Open SQL editor
3. Copy SQL from setup page
4. Run the schema

---

### "401 Unauthorized on API calls"

**Problem:** Not authenticated

**Solution:**
1. Login first
2. Setup database first
3. Verify auth token is sent in requests

---

### "Database not configured on first dashboard visit"

**Problem:** Normal! Setup wizard hasn't been completed

**Solution:**
1. Complete database setup first
2. Dashboard will work immediately after

---

## Production Deployment

### 1. Environment Variables

Set on your hosting platform (Vercel, Railway, etc):
```
SUPABASE_KEYS_ENCRYPTION_KEY=strong-random-key
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Storage Migration

**Development:** Connection strings stored in `data/user-database-connections.json`

**Production:** Migrate to encrypted database column:

```sql
-- Add to your auth database
ALTER TABLE profiles ADD COLUMN database_connection_string TEXT;
```

Then update `lib/database/user-connection.ts` to read from database instead of file.

### 3. Backups

Users are responsible for their own database backups! 
- Recommend they enable backups in their provider
- Neon: Automatic daily backups
- Railway: Manual backup feature
- AWS RDS: Automated backups

### 4. Monitoring

Monitor connection pool health:
- Check connection pooling stats
- Set max connections limit
- Handle connection timeouts gracefully

---

## Cost Model

### For Users

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Neon | 0.5GB | $0.30/hour compute + $0.25/GB storage |
| Railway | 5GB/month | $5/month + usage |
| Render | 90 days free | $7-57/month |
| AWS RDS | Free tier (1 year) | $10-100+/month |

### For You (SaaS)

Charge for:
- Dashboard features
- Advanced analytics
- API access
- Priority support
- etc.

**You don't charge for database storage!** Users pay their provider.

---

## Advantages vs Previous Supabase Model

| Aspect | Supabase | BYO Database |
|--------|----------|-------------|
| **User Setup** | Create Supabase project + configure auth | Enter connection string |
| **User Complexity** | High (auth, RLS, policies) | Low (just connection string) |
| **User Controls** | Supabase plan | Database size directly |
| **User Pays** | Supabase | Their database provider |
| **Payment Friction** | You or billing integration | Direct to provider |
| **Isolation** | RLS policies | SQL WHERE clauses |
| **Portability** | Supabase only | Any PostgreSQL |
| **Your Overhead** | Low (managed service) | Low (simple pool management) |

---

## Future Enhancements

- [ ] Multiple database support per user
- [ ] Database migration tools
- [ ] Usage tracking/analytics per user
- [ ] Automatic backups coordination
- [ ] Database clone/restore features
- [ ] Query performance monitoring
- [ ] Connection health dashboards
- [ ] Disaster recovery helpers
- [ ] Bulk data operations
- [ ] Time-travel/PITR support

---

## Support Resources

### Connection String Guides

- **Neon**: https://neon.tech/docs/get-started-with-neon/connect-from-any-application
- **Railway**: https://railway.app/docs/databases/postgresql
- **Render**: https://render.com/docs/databases
- **AWS RDS**: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/

### PostgreSQL

- Official Docs: https://www.postgresql.org/docs/
- Node.js `pg` library: https://node-postgres.com/

### Troubleshooting

- Check provider's status page
- Verify firewall rules
- Test connection locally with `psql`
- Check application logs

---

## Summary

**Before:**
- ❌ Users create Supabase project
- ❌ Users configure auth, RLS, policies
- ❌ Complex setup process
- ❌ Payment friction

**Now:**
- ✅ Users enter PostgreSQL connection string
- ✅ 5-minute setup
- ✅ Users pay provider directly
- ✅ Simple, clean architecture
- ✅ No vendor lock-in
- ✅ Users control everything

The Provision Dashboard now provides **project management features** while users bring their own **data storage**. Perfect alignment of responsibilities!
