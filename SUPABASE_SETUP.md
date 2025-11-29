# Supabase Setup Guide

This guide provides detailed step-by-step instructions for setting up Supabase authentication with the Provision Dashboard.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Basic knowledge of environment variables

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Sign up or log in to your account
4. Click **"New Project"**
5. Fill in the project details:
   - **Name**: Your project name (e.g., "Provision Dashboard")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development
6. Click **"Create new project"**
7. Wait 2-3 minutes for the project to be fully provisioned

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Copy this value
   - **anon public key**: Copy this value (under "Project API keys")

## Step 3: Configure Environment Variables

1. In your project root directory, create a file named `.env.local`
2. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace `your-project-url-here` with your Project URL from Step 2
4. Replace `your-anon-key-here` with your anon public key from Step 2
5. Save the file

**Important**: The `.env.local` file is already in `.gitignore` and will not be committed to version control.

## Step 4: Set Up Database Schema

### Option A: Using SQL Editor (Recommended for beginners)

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/migrations/001_create_profiles_table.sql` from your project
4. Copy the entire contents of that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see a success message

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in the project URL: `https://xxxxx.supabase.co`)

4. Run migrations:
   ```bash
   supabase db push
   ```

## Step 5: Configure OAuth Providers

### GitHub OAuth Setup

1. Go to [GitHub](https://github.com) and log in
2. Go to **Settings** → **Developer settings** → **OAuth Apps**
3. Click **"New OAuth App"**
4. Fill in the form:
   - **Application name**: `Provision Dashboard`
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
     - Replace `YOUR-PROJECT-REF` with your actual project reference
     - You can find this in your Supabase project URL
5. Click **"Register application"**
6. Copy the **Client ID** and generate a **Client Secret**
7. In Supabase dashboard, go to **Authentication** → **Providers**
8. Find **GitHub** in the list and click on it
9. Toggle **"Enable GitHub provider"** to ON
10. Paste your **Client ID** and **Client Secret**
11. Click **"Save"**

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click on it and click **"Enable"**
4. Create OAuth credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - If prompted, configure the OAuth consent screen first
   - Select **"Web application"** as the application type
   - Add **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - Your production URL (when ready)
   - Add **Authorized redirect URIs**:
     - `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
   - Click **"Create"**
5. Copy the **Client ID** and **Client Secret**
6. In Supabase dashboard, go to **Authentication** → **Providers**
7. Find **Google** in the list and click on it
8. Toggle **"Enable Google provider"** to ON
9. Paste your **Client ID** and **Client Secret**
10. Click **"Save"**

## Step 6: Set Up Edge Functions (for 2FA)

The 2FA functionality uses Supabase Edge Functions. You have two options:

### Option A: Use Client-Side Verification (Simpler, works out of the box)

The code already includes fallback client-side verification using the `otplib` library. This works without setting up Edge Functions, but for production, you should use Edge Functions.

### Option B: Deploy Edge Functions (Recommended for production)

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Deploy the functions:
   ```bash
   supabase functions deploy generate-2fa-secret
   supabase functions deploy verify-2fa
   ```

**Note**: The Edge Functions use Deno runtime. You may need to adjust the code in `supabase/functions/` based on your Deno version and available packages.

## Step 7: Configure Email Settings (Optional)

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. Customize the templates as needed:
   - Confirm signup
   - Reset password
   - Magic link
   - Change email address
3. Go to **Settings** → **Auth** to configure:
   - Email confirmation requirements
   - Password requirements
   - Session duration

## Step 8: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/register`

3. Try creating an account:
   - **Email/Password**: Fill in the form and submit
   - **GitHub**: Click "Continue with GitHub" (if configured)
   - **Google**: Click "Continue with Google" (if configured)

4. Check your email for confirmation (if email confirmation is enabled)

5. After registration, you should be redirected to the 2FA setup page

6. Set up 2FA:
   - Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
   - Enter the verification code
   - You should be redirected to the dashboard

7. Test logout:
   - Click the logout button in the header
   - You should be redirected to the login page

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Ensure there are no extra spaces or quotes
- Restart your development server after changing environment variables

### OAuth not working
- Verify your callback URL matches exactly in both GitHub/Google and Supabase
- Check that the provider is enabled in Supabase
- Ensure your Client ID and Secret are correct

### Database errors
- Make sure you ran the migration SQL script
- Check the Supabase dashboard → Table Editor to see if the `profiles` table exists
- Verify Row Level Security (RLS) policies are set up correctly

### 2FA not working
- If Edge Functions aren't deployed, the client-side fallback should work
- Check browser console for errors
- Ensure `otplib` package is installed: `npm install otplib`

### Users can't access dashboard
- Check middleware is working (should redirect unauthenticated users)
- Verify user has completed 2FA setup
- Check browser console and network tab for errors

## Next Steps

After setup is complete:

1. **Customize email templates** in Supabase dashboard
2. **Set up production environment** with production URLs
3. **Configure additional OAuth providers** if needed
4. **Set up email service** for better deliverability
5. **Review security settings** in Supabase dashboard

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OTPLib Documentation](https://github.com/yeojz/otplib)

---

**Need Help?** Check the main [SETUP_GUIDE.md](./SETUP_GUIDE.md) or open an issue in the repository.

