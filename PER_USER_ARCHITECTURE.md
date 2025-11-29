# Per-User Supabase Architecture Guide

## Overview

This application implements a **multi-tenant SaaS model** where each user brings their own Supabase project credentials. This enables:

- **Data Isolation**: Each user's data is stored in their own Supabase project
- **Scalability**: No single database bottleneck; scales with user count
- **Subscription Tiers**: Users can subscribe to different Supabase plans (Free, Pro, Enterprise)
- **Privacy**: Users have complete control over their data storage

## How It Works

### 1. User Onboarding Flow

When a new user registers:

```
Register → Setup Supabase (Enter own credentials) → Setup 2FA → Dashboard
```

### 2. Credential Storage

- User's Supabase URL and Anon Key are **encrypted** using AES-256-GCM
- Encrypted credentials are stored server-side in `data/user-supabase-keys.json` (dev) or a database (production)
- Each user has one set of encrypted credentials associated with their auth.user.id

### 3. Per-User Client Initialization

When a user accesses the dashboard or API routes:

1. The application retrieves the user's encrypted credentials from storage
2. Decrypts them using `SUPABASE_KEYS_ENCRYPTION_KEY`
3. Creates a Supabase client using the user's credentials
4. All data operations use the user's client (not global credentials)

## API Routes

### User Credentials Management

**Endpoint**: `GET/POST /api/user/supabase-keys`

- **GET**: Check if user has configured Supabase; returns `{connected: boolean, url?: string, anonKey?: string}`
- **POST**: Save user's Supabase credentials (body: `{url, anonKey}`)

### Data Operations (Per-User)

These routes automatically use the authenticated user's Supabase credentials:

- **GET/POST /api/projects**: Fetch/create projects from user's Supabase instance
- **GET/POST /api/tasks**: Fetch/create tasks from user's Supabase instance
- **GET/POST /api/team**: Fetch/create team members from user's Supabase instance

All routes automatically fall back gracefully if Supabase is not configured.

## Code Architecture

### File Structure

```
lib/supabase/
├── client.ts              # Browser client initialization (with mock fallback)
├── server.ts              # Server-side auth client
├── middleware.ts          # Auth middleware with env var checks
├── secure-store.ts        # Encryption/decryption of per-user credentials
└── user-client.ts         # Helper to create clients with user's credentials

app/api/
├── user/supabase-keys/    # Credential GET/POST endpoint
├── projects/route.ts      # Per-user projects API
├── tasks/route.ts         # Per-user tasks API
└── team/route.ts          # Per-user team API

app/auth/
└── setup-supabase/        # 3-step onboarding wizard

hooks/
├── useSupabaseConnection.ts      # Check if user configured Supabase
└── useUserSupabaseClient.ts       # Hook to get user's Supabase client

components/
├── modals/supabase-required-modal.tsx  # Required modal in dashboard
└── supabase-not-configured.tsx         # Setup instructions page
```

### Key Functions

**`lib/supabase/secure-store.ts`**

```typescript
saveUserKeys(userId, url, anonKey)     // Encrypt and save
getUserKeys(userId)                    // Decrypt and retrieve
hasUserKeys(userId)                    // Check if user configured
```

**`lib/supabase/user-client.ts`**

```typescript
getUserSupabaseClient()                // Get user's client (returns null if not configured)
getUserContextWithSupabaseClient()     // Get both auth user and their Supabase client
```

## Environment Variables

Required for encryption:

```env
SUPABASE_KEYS_ENCRYPTION_KEY=your-32-byte-key-or-passphrase
```

If not set, defaults to SHA-256 hash of the placeholder value (dev only).

Global Supabase credentials (used for system-level operations):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Note**: These are only used for the global auth system and middleware. All user data operations use per-user credentials.

## User Flow Example

### 1. Registration

```typescript
// User signs up with email/password
// Redirected to /auth/setup-supabase
```

### 2. Supabase Setup

```typescript
// User creates or connects to their Supabase project
// User enters: Supabase Project URL + Anon Key
// Credentials encrypted and saved via POST /api/user/supabase-keys
// Redirected to /auth/setup-2fa
```

### 3. 2FA Setup (Optional)

```typescript
// User can optionally enable 2FA
// Redirected to /dashboard
```

### 4. Dashboard Access

```typescript
// Dashboard loads useUserSupabaseClient hook
// Hook fetches user's credentials from GET /api/user/supabase-keys
// Creates client with user's credentials
// All data fetches use user's client
```

## Subscription Tiers

Users can subscribe to different plans based on Supabase tiers:

**Free Tier**
- Up to 500MB database
- 2GB bandwidth/month
- Single project

**Pro Tier**
- 8GB database
- 50GB bandwidth/month
- Multiple projects

**Enterprise Tier**
- Unlimited database
- Unlimited bandwidth
- Custom SLA
- Dedicated support

The tier is stored in `profiles.subscription_tier` and can be used to:
- Limit features per user
- Display tier-specific UI
- Track usage for billing

## Security Considerations

### Encryption

- AES-256-GCM with random IV and auth tag
- Credentials never transmitted in plaintext
- Different key for each user in production (currently using one master key for simplicity)

### Data Isolation

- Row-level security (RLS) policies in Supabase enforce user access
- API routes verify authenticated user before accessing credentials
- Each user's client can only access their own Supabase instance

### Storage

**Development**: File-based encrypted storage (`data/user-supabase-keys.json`)
**Production**: Should migrate to encrypted database column or secure vault

### Best Practices

1. **Rotate encryption key periodically** in production
2. **Use Supabase RLS policies** to enforce row-level access
3. **Audit credential access** in production
4. **Consider key escrow** for enterprise deployments
5. **Implement credential expiration** for enhanced security

## Testing the Flow

### Manual Testing

1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000/register
3. Create new account
4. You'll be redirected to `/auth/setup-supabase`
5. Create a free Supabase project at https://supabase.com
6. Copy your project URL and anon key
7. Enter credentials on the setup page
8. Complete 2FA setup
9. Access dashboard with your own Supabase instance

### API Testing

```bash
# Check if user has configured Supabase
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/supabase-keys

# Fetch projects from user's Supabase
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/projects

# Create a project
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","budget":5000}' \
  http://localhost:3000/api/projects
```

## Migration from Global to Per-User

If migrating an existing application:

1. Keep global Supabase credentials for system operations
2. Add encryption key to environment
3. Run migration to add `subscription_tier` to profiles
4. Create `/auth/setup-supabase` onboarding
5. Update API routes to use `getUserSupabaseClient()`
6. Update UI to show setup modal when not configured
7. Test data migration (may need custom script)

## Troubleshooting

### "Supabase not configured" Error

The user hasn't entered their credentials yet. Show the setup modal or redirect to `/auth/setup-supabase`.

### "Encryption key not configured"

Set `SUPABASE_KEYS_ENCRYPTION_KEY` environment variable. Must be same on all instances.

### User can't access their data

Check:
- Credentials were saved (GET `/api/user/supabase-keys` returns `connected: true`)
- RLS policies allow the user to read the table
- Table exists in user's Supabase project
- Table name matches API route expectations

### Production Deployment

1. Set `SUPABASE_KEYS_ENCRYPTION_KEY` to a strong, 32-byte key
2. Migrate encrypted storage from file to database
3. Set `NODE_ENV=production`
4. Configure backups for encrypted credential storage
5. Consider key management service (AWS KMS, Hashicorp Vault, etc.)

## Future Enhancements

- [ ] Credential refresh/rotation
- [ ] Multiple Supabase projects per user
- [ ] Backup & restore functionality
- [ ] Audit logs for credential access
- [ ] Integration with Supabase API for tier detection
- [ ] Automatic billing based on Supabase usage
- [ ] WhiteLabel support (user brings everything)
