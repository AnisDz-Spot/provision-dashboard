# Provision Dashboard - Project Management Template

A premium, modern, and highly performant Project Management Dashboard template built with Next.js, TypeScript, and Tailwind CSS. Perfect for agencies, large teams, and SaaS applications looking for a powerful internal tool interface.

## 🚀 Features

### Core Functionality
- **Comprehensive Dashboard** - Overview of key metrics, charts, and quick task view
- **Project Management** - Full CRUD operations with filtering, sorting, and search
- **Task Management** - Advanced task tracking with priority and status filtering
- **Kanban Board** - Drag-and-drop task management with real-time updates
- **Team Management** - Team member profiles with workload tracking
- **Authentication System** - Complete auth with Supabase:
  - Email/Password authentication
  - GitHub OAuth
  - Google OAuth
  - **Two-Factor Authentication (2FA) - Required for all users**
  - Protected routes with middleware
  - Session management
- **Multi-Tenant Database** - Bring Your Own PostgreSQL database
  - Secure connection string encryption
  - Per-user data isolation
  - Support for any PostgreSQL provider (Neon, Railway, Render, AWS RDS, etc.)
- **Settings Page** - User profile, 2FA status, and database connection

### Design & UX
- **Modern UI** - Clean, professional, and minimalist design
- **Fully Responsive** - Optimized for mobile, tablet, and desktop
- **Dark Mode** - Light and dark theme support with system preference detection
- **Customizable** - CSS variables for easy color scheme customization
- **High Performance** - Optimized for fast loading and smooth interactions

### Technical Features
- **Next.js 16** - Latest stable version with App Router
- **TypeScript** - Fully typed codebase with strict type checking
- **Tailwind CSS v4** - Utility-first styling
- **Recharts** - 8+ chart types (Bar, Line, Pie, Doughnut, Area, Radar, Scatter, Treemap)
- **Zustand** - Lightweight state management
- **Form Validation** - Complex forms with validation
- **Data Tables** - Responsive tables with pagination and sorting
- **Modals** - Reusable modal components

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd provision-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials (for authentication only):
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```
   - Generate and add encryption key:
     ```env
     SUPABASE_KEYS_ENCRYPTION_KEY=your-32-char-hex-string
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Follow the setup wizard**
   - Create account or login
   - Follow the 4-step "Connect Your Database" wizard
   - Provide your PostgreSQL connection string
   - The dashboard will initialize with your data

**📚 For complete setup instructions and database provider recommendations, see [BRING_YOUR_OWN_DATABASE.md](./BRING_YOUR_OWN_DATABASE.md)**

## 🏗️ Project Structure

```
provision-dashboard/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── projects/          # Projects list and detail
│   ├── tasks/             # Task management
│   ├── kanban/            # Kanban board
│   ├── team/              # Team management
│   └── settings/          # Settings page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── charts/           # Chart components
│   ├── forms/            # Form components
│   ├── tables/           # Table components
│   ├── modals/           # Modal components
│   └── layout/           # Layout components
├── data/                  # JSON data files (simulated data)
├── lib/                   # Utility functions
├── stores/                # Zustand stores
└── hooks/                 # Custom React hooks
```

## 📄 Pages Overview

### Authentication Pages
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Forgot Password** (`/forgot-password`) - Password recovery

### Main Pages
- **Dashboard** (`/dashboard`) - Overview with metrics and charts
- **Projects** (`/projects`) - Project list with filtering and search
- **Project Detail** (`/projects/[id]`) - Individual project view with tabs
- **Tasks** (`/tasks`) - Task management with advanced filtering
- **Kanban** (`/kanban`) - Drag-and-drop kanban board
- **Team** (`/team`) - Team member list
- **Team Member** (`/team/[id]`) - Individual team member profile
- **Settings** (`/settings`) - User settings and preferences
- **404** (`/not-found`) - Error page

## 🎨 Theming

The template supports light and dark modes with system preference detection. Theme can be changed via:

1. **Settings Page** - User preference selector
2. **Header Toggle** - Quick theme switcher
3. **System Preference** - Automatic detection

### Customizing Colors

Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  /* Add your custom colors */
}
```

## 📊 Chart Types

The template includes 8+ chart types using Recharts:

1. **Bar Chart** - Vertical bar charts
2. **Line Chart** - Line graphs with trends
3. **Pie Chart** - Pie charts for distribution
4. **Doughnut Chart** - Doughnut charts
5. **Area Chart** - Filled area charts
6. **Radar Chart** - Radar/spider charts
7. **Scatter Chart** - Scatter plots
8. **Treemap Chart** - Treemap visualizations

## 🔐 Authentication & Database

The template uses a modern **Bring Your Own Database** (BYO) architecture:

### Authentication
- **Supabase Auth** handles user signup, login, OAuth, and 2FA
- No need to create Supabase data tables or projects
- Users authenticate once, then connect their PostgreSQL database

### Database
- Each user provides their own **PostgreSQL connection string**
- Connection strings are encrypted and stored server-side (AES-256-GCM)
- Users pay their PostgreSQL provider directly
- Automatic data isolation via SQL (user_id filtering on every query)

### Supported PostgreSQL Providers
- **Neon** - Serverless PostgreSQL (recommended)
- **Railway** - Easy deployment
- **Render** - Simple managed PostgreSQL
- **AWS RDS** - Enterprise-grade
- **DigitalOcean** - Managed databases
- Any PostgreSQL instance (self-hosted, etc.)

### Setup Flow
1. Create account and login with Supabase
2. Follow 4-step "Connect Your Database" wizard
3. Paste your PostgreSQL connection string
4. App initializes schema automatically
5. Start using the dashboard

See [BRING_YOUR_OWN_DATABASE.md](./BRING_YOUR_OWN_DATABASE.md) for complete setup instructions and troubleshooting.

## 🔌 How Data Works

The template uses a modern multi-tenant architecture:

### Data Storage
- **Your PostgreSQL Database** - Store all projects, tasks, and team data
- **Encrypted Connection String** - Stored server-side with AES-256-GCM encryption
- **Per-User Isolation** - All queries filter by user_id automatically

### API Routes
The following API routes use your PostgreSQL database:
- `GET/POST /api/projects` - Project management
- `GET/POST /api/tasks` - Task management
- `GET/POST /api/team` - Team member management

### Database Schema
The setup wizard automatically creates the required tables:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  client TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  budget NUMERIC,
  spent NUMERIC,
  progress INTEGER,
  priority TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, id)
);

-- Similar tables for tasks, team_members
```

### Example Usage
All data operations are automatic - just use the dashboard! Under the hood:
```typescript
// This happens automatically in API routes
const query = `
  SELECT * FROM projects 
  WHERE user_id = $1 
  ORDER BY created_at DESC
`;
const result = await userPool.query(query, [userId]);
```

No need to manage connections or write SQL - the app handles it all!

## 🧩 Components

### UI Components
- `Button` - Styled button with variants
- `Input` - Form input field
- `Card` - Container card component
- `Badge` - Status and label badges
- `Avatar` - User avatar with initials
- `Select` - Dropdown select
- `Tabs` - Tab navigation
- `Label` - Form labels
- `Textarea` - Multi-line text input

### Chart Components
All chart components are located in `components/charts/` and use Recharts.

### Form Components
- `ProjectForm` - Project creation/editing form with validation
- Additional forms can be created following the same pattern

### Table Components
- `DataTable` - Responsive data table with pagination and search

### Modal Components
- `Modal` - Base modal component
- `CreateTaskModal` - Task creation modal

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📝 Data Structure

### Projects
```typescript
{
  id: string;
  name: string;
  description: string;
  status: "planning" | "in-progress" | "completed";
  client: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: string[];
  progress: number;
  priority: "high" | "medium" | "low";
}
```

### Tasks
```typescript
{
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: "to-do" | "in-progress" | "in-review" | "completed";
  priority: "high" | "medium" | "low";
  dueDate: string;
  createdAt: string;
  tags: string[];
}
```

### Team Members
```typescript
{
  id: string;
  name: string;
  email: string;
  role: string;
  status: "available" | "busy" | "away";
  workload: number;
  joinedDate: string;
  skills: string[];
  projects: string[];
}
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms

The template can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

This template is provided as-is for use in your projects. Please refer to the license file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
