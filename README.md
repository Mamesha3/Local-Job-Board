# Local Job Board

A modern, full-stack job board application built with Next.js and Appwrite. Connect local job seekers with businesses through an intuitive platform featuring real-time notifications, role-based access control, and seamless job application workflows.

## Features

### For Job Seekers
- **Browse & Search Jobs** - Find local jobs with advanced filtering by category, location, and job type
- **One-Click Apply** - Apply to jobs instantly using your uploaded resume
- **Save Jobs** - Bookmark interesting positions for later review
- **Track Applications** - Monitor the status of submitted applications in real-time
- **Profile Management** - Maintain professional profiles with resume uploads

### For Companies
- **Post Jobs** - Create and manage job listings with detailed descriptions
- **Review Applications** - View and manage incoming applications from candidates
- **Company Profile** - Showcase company information with logo and description
- **Application Management** - Track and update application statuses

### For Admins
- **User Management** - View, suspend, or ban user accounts
- **Company Verification** - Verify and manage company accounts
- **Audit Logs** - Track administrative actions across the platform
- **Platform Oversight** - Monitor jobs, applications, and platform activity

### Technical Features
- **Role-Based Access Control** - Secure middleware protecting seeker, company, and admin routes
- **Real-Time Notifications** - Live updates via Appwrite realtime subscriptions
- **Responsive Design** - Fully responsive UI built with Tailwind CSS v4
- **Smooth Animations** - Polished interactions powered by Framer Motion
- **Type Safety** - Full TypeScript support throughout the codebase

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Backend | [Appwrite](https://appwrite.io/) |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org/) + [TanStack Query](https://tanstack.com/query) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Appwrite](https://appwrite.io/) instance (cloud or self-hosted)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd local_job_board
npm install
```

### 2. Appwrite Setup

Create an Appwrite project and configure the following:

**Database Collections:**
- `users` - User profiles with role, status, and profile data
- `jobs` - Job listings with company references
- `companies` - Company profiles with verification status
- `applications` - Job applications linking seekers to jobs
- `saved_jobs` - User saved job bookmarks
- `default_resumes` - Resume storage metadata
- `notifications` - User notifications (optional, defaults to `notifications`)
- `audit_logs` - Admin action logs (optional, defaults to `audit_logs`)

**Storage Bucket:**
- Create a bucket for resume uploads and company logos

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your-bucket-id

# Appwrite Collections
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=your-users-collection-id
NEXT_PUBLIC_APPWRITE_COLLECTION_JOBS=your-jobs-collection-id
NEXT_PUBLIC_APPWRITE_COLLECTION_COMPANIES=your-companies-collection-id
NEXT_PUBLIC_APPWRITE_COLLECTION_APPLICATIONS=your-applications-collection-id
NEXT_PUBLIC_APPWRITE_COLLECTION_SAVED_JOBS=your-saved-jobs-collection-id
NEXT_PUBLIC_APPWRITE_COLLECTION_DEFAULT_RESUMES=your-resumes-collection-id
NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS=your-notifications-collection-id

# Server-side Only
APPWRITE_API_KEY=your-api-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
local_job_board/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (admin, applications)
│   │   ├── dashboard/         # Role-based dashboards
│   │   │   ├── admin/        # Admin management panel
│   │   │   ├── company/      # Company job management
│   │   │   ├── seeker/       # Job seeker dashboard
│   │   │   └── layout.tsx    # Dashboard layout wrapper
│   │   ├── jobs/             # Job detail and listing pages
│   │   ├── login/            # Authentication pages
│   │   ├── register/
│   │   ├── page.tsx          # Landing page
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── jobs/            # JobCard, JobList, ApplyButton
│   │   └── layout/          # Navigation components
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── QueryProvider.tsx # TanStack Query setup
│   ├── hooks/
│   │   ├── useJobs.ts       # Job data fetching
│   │   ├── useApplications.ts
│   │   ├── useCompanies.ts
│   │   ├── useRealtime.ts   # Real-time subscriptions
│   │   └── ...
│   ├── lib/
│   │   ├── appwrite.ts      # Client-side Appwrite SDK
│   │   └── appwrite-admin.ts # Server-side Appwrite SDK
│   ├── services/            # Business logic layer
│   │   ├── jobs.ts
│   │   ├── applications.ts
│   │   ├── companies.ts
│   │   └── ...
│   └── middleware.ts        # Route protection & role checks
├── public/                  # Static assets
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## User Roles

The application supports three user roles with distinct permissions:

| Role | Description | Access |
|------|-------------|--------|
| `seeker` | Job seeker looking for local employment | Browse jobs, apply, save jobs, manage profile |
| `company` | Business posting job listings | Post jobs, review applications, manage company profile |
| `admin` | Platform administrator | Manage users, verify companies, view audit logs |

## Key Implementation Details

### Authentication Flow
- Uses Appwrite Account API for session management
- Role stored in cookies for middleware access
- Protected routes via `middleware.ts`

### Real-Time Updates
- Appwrite Realtime API for live notifications
- Subscriptions to jobs, applications, and notifications collections
- Automatic UI updates when data changes

### Resume Handling
- Resumes stored in Appwrite Storage bucket
- Direct download URLs constructed for secure access
- Resume metadata tracked in `default_resumes` collection

### Security
- Server-side API key for admin operations (`appwrite-admin.ts`)
- Middleware protects role-specific routes
- User status checking (active/suspended/banned)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

### Other Platforms

Build the application:

```bash
npm run build
```

The `out` directory will contain the static export (configure `output: 'export'` in `next.config.ts` if needed).

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
