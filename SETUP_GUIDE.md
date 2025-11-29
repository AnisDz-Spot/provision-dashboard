# Setup Guide

This guide will walk you through setting up and configuring the Provision Dashboard template.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn** or **pnpm**
- **Git** (for version control)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts
- Zustand
- React Hook Form
- Zod
- Lucide React
- And other dependencies

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 3. Build for Production

```bash
npm run build
npm run start
```

## Supabase Setup

This project uses Supabase for authentication and database. Follow these steps to set up Supabase:

### 1. Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up for a free account
3. Create a new project
4. Wait for the project to be fully provisioned (this may take a few minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-project-url` and `your-anon-key` with the values from step 2.

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste the contents of `supabase/migrations/001_create_profiles_table.sql`
3. Run the query to create the profiles table and necessary functions

Alternatively, you can use the Supabase CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Configure OAuth Providers (Optional but Recommended)

#### GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Provision Dashboard
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**
5. In Supabase dashboard, go to **Authentication** → **Providers** → **GitHub**
6. Enable GitHub provider and paste your Client ID and Client Secret
7. Save

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:3000` (and your production URL)
   - **Authorized redirect URIs**: `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copy the **Client ID** and **Client Secret**
7. In Supabase dashboard, go to **Authentication** → **Providers** → **Google**
8. Enable Google provider and paste your Client ID and Client Secret
9. Save

### 6. Set Up Supabase Edge Functions (for 2FA)

1. Install Supabase CLI (if not already installed):

   ```bash
   npm install -g supabase
   ```

2. Login and link your project:

   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. Deploy the Edge Functions:

   ```bash
   # Deploy generate-2fa-secret function
   supabase functions deploy generate-2fa-secret

   # Deploy verify-2fa function
   supabase functions deploy verify-2fa
   ```

4. For the `verify-2fa` function, you'll need to install the `otpauth` package. Update the function to use a compatible version or use a different TOTP library.

   **Note**: The Edge Functions use Deno runtime. You may need to adjust the imports based on your Deno version.

### 7. Configure Email Templates (Optional)

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link
   - Change email address

### 8. Test Authentication

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/register`
3. Try creating an account with email
4. Check your email for the confirmation link (if email confirmation is enabled)
5. Try logging in with GitHub or Google OAuth

## Configuration

### Environment Variables

Your `.env.local` file should now contain:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: App Configuration
NEXT_PUBLIC_APP_NAME=Provision Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### TypeScript Configuration

The project uses strict TypeScript settings. All files should be properly typed. If you encounter type errors:

1. Check that all imports are correct
2. Ensure types are defined for all props and state
3. Use `any` only when absolutely necessary (and add a TODO to fix it)

### Tailwind Configuration

Tailwind CSS v4 is configured via `app/globals.css`. To customize:

1. Edit CSS variables in `:root` and `.dark` selectors
2. Add custom utilities in the `@theme` directive
3. Modify color schemes in the theme variables

### ESLint and Prettier

The project includes pre-configured ESLint and Prettier:

- **ESLint**: Run `npm run lint` to check for linting errors
- **Prettier**: Format code automatically on save (if configured in your editor)

## Project Structure

```
provision-dashboard/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes (grouped)
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── dashboard/           # Main dashboard
│   ├── projects/            # Projects pages
│   │   └── [id]/           # Dynamic project detail
│   ├── tasks/              # Tasks page
│   ├── kanban/             # Kanban board
│   ├── team/               # Team pages
│   │   └── [id]/          # Dynamic team member
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects)
│   ├── not-found.tsx      # 404 page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Base UI components
│   ├── charts/            # Chart components
│   ├── forms/             # Form components
│   ├── tables/            # Table components
│   ├── modals/            # Modal components
│   └── layout/            # Layout components
├── data/                  # JSON data files
├── lib/                   # Utility functions
├── stores/                # Zustand stores
└── hooks/                 # Custom hooks
```

## Data Management

### Current Setup (JSON Files)

The template currently uses JSON files in the `data/` directory for simulation:

- `projects.json` - Project data
- `tasks.json` - Task data
- `team.json` - Team member data
- `activity.json` - Activity log data

### Migrating to API

To integrate with a real API:

1. **Create API Routes** in `app/api/`:

```typescript
// app/api/projects/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Fetch from database
  const projects = await db.projects.findMany();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Create project in database
  const project = await db.projects.create({ data: body });
  return NextResponse.json(project);
}
```

2. **Update Components** to fetch from API:

```typescript
// Before (JSON import)
import projectsData from "@/data/projects.json";

// After (API fetch)
const response = await fetch("/api/projects");
const projectsData = await response.json();
```

3. **Add Loading States**:

```typescript
const [loading, setLoading] = useState(true);
const [projects, setProjects] = useState([]);

useEffect(() => {
  fetchProjects();
}, []);

async function fetchProjects() {
  setLoading(true);
  const response = await fetch("/api/projects");
  const data = await response.json();
  setProjects(data);
  setLoading(false);
}
```

## Authentication Features

The project includes full authentication with Supabase:

### Supported Authentication Methods

1. **Email/Password** - Traditional email and password authentication
2. **GitHub OAuth** - Sign in with GitHub account
3. **Google OAuth** - Sign in with Google account
4. **Two-Factor Authentication (2FA)** - Required for all users

### Authentication Flow

1. **Registration**:

   - User signs up with email/password or OAuth
   - Profile is automatically created in the database
   - User is redirected to 2FA setup page
   - User must enable 2FA before accessing the dashboard

2. **Login**:

   - User signs in with their credentials
   - If 2FA is enabled, user is redirected to 2FA verification
   - After verification, user can access the dashboard

3. **Protected Routes**:
   - All routes except auth pages are protected
   - Unauthenticated users are redirected to login
   - Authenticated users are redirected away from auth pages

### Two-Factor Authentication

2FA is **required** for all users. The setup process:

1. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
2. User enters verification code
3. 2FA is enabled and stored securely
4. On subsequent logins, user must enter 2FA code

### Logout

Users can logout from the header menu. This clears the session and redirects to login.

## Customization

### Changing Colors

Edit `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Change primary color */
  /* Add more custom colors */
}
```

### Adding New Pages

1. Create a new directory in `app/`
2. Add `page.tsx` file
3. Use `MainLayout` wrapper for consistent layout
4. Add navigation link in `components/layout/sidebar.tsx`

### Adding New Components

1. Create component file in appropriate directory
2. Export from index file if needed
3. Use TypeScript for all props
4. Follow existing component patterns

## Performance Optimization

### Image Optimization

Use Next.js `Image` component:

```tsx
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>;
```

### Code Splitting

Next.js automatically code-splits by route. For additional splitting:

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("@/components/HeavyComponent"), {
  loading: () => <p>Loading...</p>,
});
```

### Caching

Configure caching in API routes:

```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

### Other Platforms

1. Build the project: `npm run build`
2. Start production server: `npm run start`
3. Configure environment variables
4. Set up reverse proxy if needed

## Troubleshooting

### Common Issues

**Issue**: TypeScript errors

- **Solution**: Ensure all types are properly defined. Check `tsconfig.json` settings.

**Issue**: Tailwind styles not applying

- **Solution**: Check `tailwind.config` and ensure classes are not purged.

**Issue**: Charts not rendering

- **Solution**: Ensure Recharts is installed and components are client-side (`"use client"`).

**Issue**: Theme not switching

- **Solution**: Check browser localStorage and ensure ThemeProvider is in root layout.

### Getting Help

1. Check the documentation files
2. Review component examples
3. Check Next.js and library documentation
4. Open an issue in the repository

## Next Steps

After setup:

1. **Customize the design** - Update colors, fonts, and styles
2. **Add your data** - Replace JSON files with real API calls
3. **Implement authentication** - Add real user authentication
4. **Add features** - Extend functionality as needed
5. **Deploy** - Deploy to your preferred platform

## Additional Resources

---

### Connecting Supabase from the App (Notes)

- **Project-level keys**: The `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are project-level settings. They must be configured in your hosting environment (for example, Vercel or Netlify) for production — they cannot be set from the public web UI of the app itself.
- **Local development**: Create a `.env.local` file in the project root with the keys (an example `.env.local` with placeholders has been added to the repository). After adding or updating `.env.local`, restart the development server:

```powershell
npm run dev
```

- **In-app "Connect Supabase" flow (optional)**: If your goal is to let each user connect their _own_ Supabase project, you'll need a secure server-side flow to store and use per-user keys. This template assumes a single, project-level Supabase instance configured via environment variables.

### Troubleshooting: "Your project's URL and Key are required" runtime error

- **Symptom**: Middleware crashes with: `Your project's URL and Key are required to create a Supabase client!` and the stack trace points at `lib/supabase/middleware.ts`.
- **Cause**: The app attempted to call `createServerClient(...)` while `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` were undefined.
- **Fix**: Add the two environment variables to `.env.local` (for development) or to your host's environment variables (for production), then restart the app. The repository includes a middleware guard so the app will redirect unauthenticated visitors to `/login` instead of throwing when env vars are not present.

### Per-user Supabase connection (optional)

- This project includes an optional per-user "Connect Supabase" flow. It allows a signed-in user to provide their own Supabase `URL` and `anon/public key`. The values are encrypted on the server and stored in `data/user-supabase-keys.json`.
- To enable this feature, set a server-side encryption key in your environment:

```env
SUPABASE_KEYS_ENCRYPTION_KEY=some-strong-secret-or-base64
```

- The connect page is available at `/settings/connect-supabase` once you're signed in. The API endpoint used is `/api/user/supabase-keys` (GET to check, POST to save).
- Security notes:

  - The current implementation stores encrypted data in a file under `data/` for simplicity and local development. For production, consider using a secure database or secret manager (AWS Secrets Manager, HashiCorp Vault, or a protected DB table).

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
