# RepoSpace

RepoSpace is a SaaS-style portfolio builder for developers. It turns a GitHub profile into a public portfolio site with a guided dashboard, project syncing, multiple visual themes, portfolio publishing, and lightweight analytics.

The current app is built with Next.js App Router, Supabase authentication/database, `next-intl` for multilingual UI, and `next-themes` for light/dark mode. Users sign in with GitHub, pull in repositories, customize their profile, choose a theme, and publish a portfolio at `/portfolio/[username]` or through subdomain routing.

## What The Project Does

- GitHub OAuth login through Supabase
- Automatic profile creation on first sign-in
- Dashboard for profile editing, project management, publishing, and theme selection
- GitHub repository sync/import flow with plan-based project limits
- Three portfolio themes: `minimal`, `bento`, and `terminal`
- Public portfolio pages with preview mode
- Analytics tracking with self-view protection for owners/previews
- Internationalized UI with English, Uzbek, and Russian messages
- Light/dark theme support across the product
- Middleware-based support for `username.localhost:3000` and production subdomains

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix UI
- Supabase SSR + Supabase Auth/Postgres
- `next-intl`
- `next-themes`
- Recharts
- Zustand
- React Hook Form + Zod

## Main App Areas

### Marketing and Auth

- `/` landing page
- `/login` GitHub sign-in page
- `/callback` OAuth session exchange and first-profile bootstrap

### Dashboard

- `/dashboard` overview with stats and analytics
- `/dashboard/projects` GitHub sync and project editing
- `/dashboard/settings` profile, social links, publishing, and custom domain waitlist
- `/dashboard/theme` theme selection with live iframe preview

### Public Portfolio

- `/portfolio/[username]` public portfolio page
- Middleware rewrites `username.<base-domain>` to the portfolio route
- Preview mode available through `?preview=true`

## Data Model

The app expects Supabase tables for:

- `profiles`
- `projects`
- `analytics_events`

From the current code, `profiles` also includes fields such as theme selection, plan tier, hireable/custom-domain flags, and `custom_data` used for waitlist interests.

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_DOMAIN=localhost:3000
```

Notes:

- `NEXT_PUBLIC_APP_URL` is used when generating share/preview links in the dashboard.
- `NEXT_PUBLIC_BASE_DOMAIN` is used by middleware for subdomain routing. In production this would be your real base domain.

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

For local portfolio subdomain testing, the middleware also supports hosts like:

```text
username.localhost:3000
```

## Project Structure

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/
    portfolio/
  components/
    dashboard/
    portfolio/
    providers/
    ui/
  hooks/
  i18n/
  lib/
    supabase/
  types/
  middleware.ts
```

## Product Flow

1. User signs in with GitHub.
2. The callback route exchanges the code for a session and creates a `profiles` row if needed.
3. The dashboard loads profile, projects, and recent analytics from Supabase.
4. The user syncs public repositories from GitHub and imports selected repos as projects.
5. The user edits profile details, enables publishing, and picks a portfolio theme.
6. The portfolio becomes available at `/portfolio/[username]` and can also be served from a subdomain.

## Current Notes

- The repository still contains some product ideas beyond the basic MVP, including custom-domain waitlist hooks and feedback endpoints.
- The README here reflects the code currently present in `src/`, not only the original planning spec.
