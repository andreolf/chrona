# Chrona

**Time Tracking & Delivery Platform for Freelancers**

Chrona is the "truth layer" for freelance work — tracking time logged, deliverables attached, work approved, and ready for continuous payment streams.

![Chrona Dashboard](https://via.placeholder.com/800x400?text=Chrona+Dashboard)

## Features

### For Freelancers
- ⏱️ **Time Logging** — Log daily time entries with project, hours, description, and deliverable links
- 📋 **Weekly Timesheets** — Auto-aggregated weekly views with delivery summaries
- 📤 **Submit for Review** — Submit timesheets for admin approval
- 💬 **Comments** — Communicate with admins on timesheet feedback

### For Admins
- 👥 **Multi-Freelancer Support** — Manage multiple team members
- ✅ **Approve/Request Changes** — Review and approve timesheets
- 📊 **Dashboard Metrics** — See hours logged, pending reviews, and approvals
- 📥 **CSV Exports** — Export timesheets and time entries
- 🏗️ **Project Management** — Create and manage projects

### Payment Ready
- 💵 Hourly rate configuration
- 💱 Currency preferences (USD, USDC, USDT)
- 🔄 Schema ready for streaming/vesting payments (coming soon)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Forms**: React Hook Form + Zod
- **Mutations**: Server Actions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chrona.git
cd chrona
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the migration files in order:
   ```
   supabase/migrations/00001_initial_schema.sql
   supabase/migrations/00002_rls_policies.sql
   supabase/migrations/00003_storage.sql
   ```

### 4. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in your Supabase dashboard under **Settings → API**.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create your first account

1. Go to `/auth/signup`
2. The first user to sign up becomes the **Admin**
3. Subsequent users become **Freelancers**
4. Admins can change user roles in `/app/users`

## Project Structure

```
src/
├── app/
│   ├── app/                    # Protected app routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── time/               # Time entry management
│   │   ├── timesheets/         # Timesheet management
│   │   ├── projects/           # Project management
│   │   ├── users/              # User management (admin)
│   │   └── settings/           # User settings
│   └── auth/                   # Authentication routes
├── components/
│   ├── app/                    # App-specific components
│   ├── time/                   # Time entry components
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── actions/                # Server actions
│   ├── supabase/               # Supabase clients & types
│   ├── validations/            # Zod schemas
│   └── utils/                  # Utility functions
└── hooks/                      # Custom React hooks
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `organizations` | Multi-tenant organization support |
| `profiles` | User profiles with roles and payment preferences |
| `projects` | Projects to track time against |
| `time_entries` | Individual time log entries |
| `timesheets` | Weekly aggregated timesheets |
| `timesheet_comments` | Comments on timesheets |
| `attachments` | File attachments |

### Row Level Security (RLS)

All tables have RLS policies ensuring:
- Users can only access their own data
- Admins can access all data in their organization
- Proper authorization for mutations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |

## API Routes & Server Actions

All mutations use Next.js Server Actions:

- `createTimeEntry` / `updateTimeEntry` / `deleteTimeEntry`
- `submitTimesheet` / `approveTimesheet` / `requestChanges`
- `createProject` / `updateProject` / `archiveProject`
- `updateUserRole` / `updateUserStatus`
- `exportTimesheetCSV` / `exportDateRangeCSV`

## Timesheet Workflow

```
┌─────────┐     ┌───────────┐     ┌───────────────────┐     ┌──────────┐
│  Draft  │────▶│ Submitted │────▶│ Changes Requested │────▶│ Approved │
└─────────┘     └───────────┘     └───────────────────┘     └──────────┘
                      │                     │
                      └─────────────────────┘
                           (resubmit)
```

## Known Limitations

1. **No real-time updates** — Requires page refresh to see changes made by others
2. **No file uploads** — Attachment upload UI not implemented (schema ready)
3. **No password reset** — Users must contact admin
4. **No invite system** — Users self-register
5. **No multi-organization** — Single org for v0 (schema supports it)
6. **No mobile optimization** — Desktop-first design

## Roadmap

### v1.0 (Current)
- ✅ Time logging with projects
- ✅ Weekly timesheets
- ✅ Approval workflow
- ✅ CSV exports
- ✅ Role-based access

### v1.1 (Planned)
- [ ] Real-time updates with Supabase subscriptions
- [ ] File attachment uploads
- [ ] Email notifications
- [ ] Mobile-responsive design

### v2.0 (Future)
- [ ] 💸 **Payment Streaming** — Continuous pay as work happens
- [ ] 📊 **Analytics Dashboard** — Trends and insights
- [ ] 🧾 **Invoice Generation** — Auto-generate invoices
- [ ] 🔗 **Integrations** — GitHub, Jira, Slack

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ using Next.js, Supabase, and shadcn/ui
