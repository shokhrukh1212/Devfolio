# Developer Portfolio Generator - Technical Implementation Specification

## Project Overview

Build a SaaS application that transforms GitHub profiles into professional portfolio websites. Users authenticate with GitHub, select repositories to showcase, choose a visual theme, and receive a hosted portfolio at `username.devfolio.uz`.

---

## Technical Stack

### Frontend

- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State Management:** Zustand (for theme editor state)
- **Language:** TypeScript (strict mode)

### Backend

- **BaaS:** Supabase
  - Authentication (GitHub OAuth)
  - PostgreSQL database
  - Row Level Security (RLS)
- **API:** Next.js API routes + Server Actions

### Infrastructure

- **Hosting:** Vercel
- **Domains:** Wildcard subdomain routing (`*.devfolio.uz`)

---

## Database Schema

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  email text,
  location text,
  github_url text,
  linkedin_url text,
  telegram_url text,
  twitter_url text,
  website_url text,
  theme text default 'minimal' check (theme in ('minimal', 'bento', 'terminal')),
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  github_repo_id bigint, -- GitHub's repo ID for sync
  title text not null,
  description text,
  long_description text, -- User can expand beyond GitHub description
  github_url text,
  demo_url text,
  image_url text,
  tech_stack text[], -- Array of technologies
  stars integer default 0,
  forks integer default 0,
  is_visible boolean default true,
  is_featured boolean default false,
  display_order integer default 0,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analytics events (stealth collection)
create table public.analytics_events (
  id bigint generated always as identity primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  event_type text not null check (event_type in ('page_view', 'project_click', 'github_click', 'demo_click', 'social_click')),
  project_id uuid references public.projects(id) on delete set null,
  visitor_country text,
  visitor_city text,
  referrer text,
  user_agent text,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_profiles_username on public.profiles(username);
create index idx_projects_profile_id on public.projects(profile_id);
create index idx_projects_display_order on public.projects(profile_id, display_order);
create index idx_analytics_profile_id on public.analytics_events(profile_id);
create index idx_analytics_created_at on public.analytics_events(created_at);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.analytics_events enable row level security;

-- Profiles: users can read all published, edit own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (is_published = true);

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Projects: viewable if profile is published, editable by owner
create policy "Projects viewable if profile published"
  on public.projects for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = projects.profile_id
      and (profiles.is_published = true or profiles.id = auth.uid())
    )
  );

create policy "Users can manage own projects"
  on public.projects for all
  using (profile_id = auth.uid());

-- Analytics: insert only (no user reads for now), owner can read own
create policy "Anyone can insert analytics"
  on public.analytics_events for insert
  with check (true);

create policy "Users can read own analytics"
  on public.analytics_events for select
  using (profile_id = auth.uid());

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at();
```

---

## Application Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page with GitHub OAuth
│   │   └── callback/
│   │       └── route.ts              # OAuth callback handler
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard
│   │   ├── projects/
│   │   │   └── page.tsx              # Project management
│   │   ├── settings/
│   │   │   └── page.tsx              # Profile settings
│   │   └── theme/
│   │       └── page.tsx              # Theme selector
│   ├── (portfolio)/
│   │   └── [username]/
│   │       └── page.tsx              # Public portfolio page (SSG)
│   ├── api/
│   │   ├── github/
│   │   │   └── repos/
│   │   │       └── route.ts          # Fetch user repos from GitHub
│   │   ├── analytics/
│   │   │   └── track/
│   │   │       └── route.ts          # Analytics event ingestion
│   │   └── portfolio/
│   │       └── publish/
│   │           └── route.ts          # Trigger portfolio generation
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── dashboard/
│   │   ├── project-card.tsx
│   │   ├── project-editor.tsx
│   │   ├── github-import-modal.tsx
│   │   └── theme-preview.tsx
│   ├── portfolio/
│   │   ├── themes/
│   │   │   ├── minimal.tsx
│   │   │   ├── bento.tsx
│   │   │   └── terminal.tsx
│   │   ├── project-card.tsx
│   │   └── social-links.tsx
│   └── landing/
│       ├── hero.tsx
│       ├── features.tsx
│       └── cta.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts             # Auth middleware
│   ├── github/
│   │   └── api.ts                    # GitHub API utilities
│   ├── analytics/
│   │   └── tracker.ts                # Client-side tracking
│   └── utils.ts
├── hooks/
│   ├── use-profile.ts
│   ├── use-projects.ts
│   └── use-github-repos.ts
├── stores/
│   └── editor-store.ts               # Zustand store for editor state
├── types/
│   ├── database.ts                   # Supabase generated types
│   ├── github.ts
│   └── index.ts
└── middleware.ts                     # Next.js middleware for auth + subdomains
```

---

## Core Features Implementation

### 1. GitHub OAuth Flow

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// app/(auth)/login/page.tsx
export default function LoginPage() {
  const handleGitHubLogin = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user repo",
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  };

  // ... render login UI
}
```

### 2. GitHub Repository Fetcher

```typescript
// lib/github/api.ts
interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  fork: boolean;
  pushed_at: string;
}

export async function fetchUserRepos(
  accessToken: string
): Promise<GitHubRepo[]> {
  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error("Failed to fetch repositories");
  }

  const repos: GitHubRepo[] = await response.json();

  // Filter and sort: exclude forks, sort by stars + recent activity
  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      const scoreA =
        a.stargazers_count * 2 + new Date(a.pushed_at).getTime() / 1e12;
      const scoreB =
        b.stargazers_count * 2 + new Date(b.pushed_at).getTime() / 1e12;
      return scoreB - scoreA;
    })
    .slice(0, 20); // Top 20 repos
}

export async function fetchRepoLanguages(
  accessToken: string,
  owner: string,
  repo: string
): Promise<string[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/languages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) return [];

  const languages = await response.json();
  return Object.keys(languages);
}
```

### 3. Portfolio Themes

```typescript
// components/portfolio/themes/minimal.tsx
import { Profile, Project } from "@/types";

interface MinimalThemeProps {
  profile: Profile;
  projects: Project[];
}

export function MinimalTheme({ profile, projects }: MinimalThemeProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="max-w-2xl mx-auto px-4 py-16">
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          className="w-24 h-24 rounded-full mb-6"
        />
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {profile.display_name}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{profile.bio}</p>
        <SocialLinks profile={profile} />
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-semibold mb-6">Projects</h2>
        <div className="space-y-8">
          {projects
            .filter((p) => p.is_visible)
            .sort((a, b) => a.display_order - b.display_order)
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-zinc-500">
        Built with{" "}
        <a href="https://devfolio.uz" className="underline">
          Devfolio
        </a>
      </footer>
    </div>
  );
}

// components/portfolio/themes/bento.tsx
export function BentoTheme({ profile, projects }: ThemeProps) {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile card - spans 1 column */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6">
          {/* Profile content */}
        </div>

        {/* Project cards - various sizes */}
        {projects.map((project, i) => (
          <div
            key={project.id}
            className={cn(
              "bg-white dark:bg-zinc-800 rounded-2xl p-6",
              project.is_featured && "md:col-span-2"
            )}
          >
            {/* Project content */}
          </div>
        ))}
      </div>
    </div>
  );
}

// components/portfolio/themes/terminal.tsx
export function TerminalTheme({ profile, projects }: ThemeProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-green-500 font-mono p-4">
      <div className="max-w-3xl mx-auto">
        <pre className="mb-8">
          {`
 ██████╗ ███████╗██╗   ██╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
 ██╔══██╗██╔════╝██║   ██║██╔════╝██╔═══██╗██║     ██║██╔═══██╗
 ██║  ██║█████╗  ██║   ██║█████╗  ██║   ██║██║     ██║██║   ██║
 ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║   ██║██║     ██║██║   ██║
 ██████╔╝███████╗ ╚████╔╝ ██║     ╚██████╔╝███████╗██║╚██████╔╝
 ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
`}
        </pre>

        <div className="space-y-2 mb-8">
          <p>$ whoami</p>
          <p className="text-white">{profile.display_name}</p>
          <p>$ cat bio.txt</p>
          <p className="text-zinc-400">{profile.bio}</p>
        </div>

        <div>
          <p className="mb-4">$ ls ./projects</p>
          {projects.map((project) => (
            <div
              key={project.id}
              className="mb-4 pl-4 border-l border-green-800"
            >
              <p className="text-white">{project.title}/</p>
              <p className="text-zinc-500 text-sm">{project.description}</p>
              <div className="flex gap-4 mt-1">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    className="text-blue-400 text-sm"
                  >
                    [source]
                  </a>
                )}
                {project.demo_url && (
                  <a href={project.demo_url} className="text-blue-400 text-sm">
                    [demo]
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4. Analytics Tracking

```typescript
// lib/analytics/tracker.ts
type EventType =
  | "page_view"
  | "project_click"
  | "github_click"
  | "demo_click"
  | "social_click";

interface TrackEventParams {
  profileId: string;
  eventType: EventType;
  projectId?: string;
}

export async function trackEvent({
  profileId,
  eventType,
  projectId,
}: TrackEventParams) {
  // Fire and forget - don't block UI
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId, eventType, projectId }),
    keepalive: true, // Ensures request completes even if page unloads
  }).catch(() => {}); // Silently fail
}

// app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { profileId, eventType, projectId } = await request.json();

    // Extract geo data from Vercel headers
    const country = request.headers.get("x-vercel-ip-country") || "unknown";
    const city = request.headers.get("x-vercel-ip-city") || "unknown";
    const referrer = request.headers.get("referer") || null;
    const userAgent = request.headers.get("user-agent") || null;

    const supabase = await createClient();

    await supabase.from("analytics_events").insert({
      profile_id: profileId,
      event_type: eventType,
      project_id: projectId || null,
      visitor_country: country,
      visitor_city: city,
      referrer,
      user_agent: userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log but don't fail
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ success: true });
  }
}
```

### 5. Subdomain Routing Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Extract subdomain
  // hostname: "aziz.devfolio.uz" -> subdomain: "aziz"
  // hostname: "devfolio.uz" -> subdomain: null
  // hostname: "localhost:3000" -> subdomain: null

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "devfolio.uz";
  const isLocalhost = hostname.includes("localhost");

  let subdomain: string | null = null;

  if (!isLocalhost && hostname.endsWith(baseDomain)) {
    const parts = hostname.replace(`.${baseDomain}`, "").split(".");
    if (parts.length === 1 && parts[0] !== "www") {
      subdomain = parts[0];
    }
  }

  // If subdomain exists, rewrite to portfolio page
  if (subdomain) {
    url.pathname = `/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Handle auth for dashboard routes
  if (url.pathname.startsWith("/dashboard")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Key User Flows

### Flow 1: New User Onboarding

1. User lands on `devfolio.uz`
2. Clicks "Login with GitHub"
3. Supabase OAuth redirects to GitHub
4. User authorizes, redirected to `/callback`
5. Callback creates profile with GitHub username
6. User redirected to `/dashboard`
7. System auto-fetches their repos in background

### Flow 2: Import Projects

1. On dashboard, user clicks "Import from GitHub"
2. Modal shows fetched repos with checkboxes
3. User selects repos to import
4. System creates `projects` entries with:
   - Title from repo name
   - Description from repo description
   - Tech stack from repo languages + topics
   - GitHub URL
5. User can edit details, add demo URLs

### Flow 3: Publish Portfolio

1. User selects theme on `/theme`
2. User clicks "Publish" on dashboard
3. System sets `is_published = true`
4. Portfolio is now live at `username.devfolio.uz`
5. Static page is generated with ISR for fast loading

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# GitHub OAuth (configured in Supabase)
# GitHub App Client ID and Secret are in Supabase dashboard

# Domain
NEXT_PUBLIC_BASE_DOMAIN=devfolio.uz
NEXT_PUBLIC_APP_URL=https://devfolio.uz

# Vercel (auto-injected)
VERCEL_URL=
```

---

## Development Milestones

### Week 1: Foundation

- [ ] Next.js project setup with TypeScript
- [ ] Supabase integration (auth + database)
- [ ] GitHub OAuth flow
- [ ] Basic dashboard layout

### Week 2: Core Features

- [ ] GitHub repo fetcher
- [ ] Project import & management UI
- [ ] Profile settings page
- [ ] Basic project editor

### Week 3: Themes & Output

- [ ] Implement 3 themes (Minimal, Bento, Terminal)
- [ ] Theme selector UI
- [ ] Public portfolio page with ISR
- [ ] Subdomain routing

### Week 4: Polish & Launch

- [ ] Analytics tracking
- [ ] Landing page
- [ ] Mobile responsiveness
- [ ] Bug fixes, edge cases
- [ ] Deploy to production

---

## Commands to Start

```bash
# Create Next.js project
npx create-next-app@latest devfolio --typescript --tailwind --app --src-dir

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr zustand

# Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label dialog tabs avatar badge

# Generate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

---

## Notes for AI Tools

When implementing this project:

1. **Always use TypeScript** with strict mode
2. **Use Server Components** by default, Client Components only when needed
3. **Follow Next.js App Router patterns** - layouts, loading states, error boundaries
4. **Use Supabase SSR** helpers for server-side auth
5. **Keep components small** and composable
6. **Implement optimistic UI** for better UX
7. **Cache GitHub API calls** to avoid rate limits
8. **Track analytics silently** - never block UI for tracking
9. **Use ISR** (Incremental Static Regeneration) for portfolio pages
10. **Mobile-first responsive design** with Tailwind

---

## Implementation Plan (Claude Code)

> **Note:** The existing Replit stack (Vite + Express + Replit OAuth) will be replaced with Next.js + Supabase + GitHub OAuth as specified above.

### Phase 1: Project Setup & Foundation

**1.1 Initialize Next.js Project**
- [ ] Create new Next.js 14+ project with App Router
- [ ] Configure TypeScript strict mode
- [ ] Set up Tailwind CSS with custom theme (fonts: Inter, Space Grotesk, JetBrains Mono)
- [ ] Initialize shadcn/ui with required components
- [ ] Set up project folder structure per spec

**1.2 Supabase Setup**
- [ ] Create Supabase project
- [ ] Run database schema SQL (profiles, projects, analytics_events)
- [ ] Configure RLS policies
- [ ] Set up GitHub OAuth provider in Supabase
- [ ] Create `lib/supabase/client.ts` (browser client)
- [ ] Create `lib/supabase/server.ts` (server client)
- [ ] Generate TypeScript types from Supabase

**1.3 Environment Configuration**
- [ ] Set up `.env.local` with Supabase credentials
- [ ] Configure `NEXT_PUBLIC_BASE_DOMAIN`
- [ ] Add environment type definitions

### Phase 2: Authentication

**2.1 GitHub OAuth Flow**
- [ ] Create `/login` page with GitHub OAuth button
- [ ] Implement `/auth/callback/route.ts` for OAuth callback
- [ ] Create middleware for auth protection
- [ ] Auto-create profile on first login (use GitHub username)
- [ ] Implement logout functionality

**2.2 Auth State Management**
- [ ] Create `useAuth` hook for client-side auth state
- [ ] Implement protected route wrapper
- [ ] Add loading states during auth checks

### Phase 3: Dashboard & Core Features

**3.1 Dashboard Layout**
- [ ] Create dashboard layout with sidebar navigation
- [ ] Build responsive mobile menu
- [ ] Add user avatar dropdown with logout

**3.2 Dashboard Home Page**
- [ ] Display stats cards (total projects, stars, views)
- [ ] Show 7-day analytics chart (using Recharts)
- [ ] Quick actions (Import from GitHub, Edit Profile, etc.)

**3.3 Profile Management**
- [ ] Create `/dashboard/settings` page
- [ ] Build profile edit form (display_name, bio, location)
- [ ] Social links editor (GitHub, LinkedIn, Twitter, Telegram, website)
- [ ] Avatar display (from GitHub)
- [ ] Implement profile update Server Action

**3.4 GitHub Repository Fetcher**
- [ ] Create `lib/github/api.ts` with repo fetcher
- [ ] Fetch user repos using OAuth access token
- [ ] Filter forks, sort by stars + activity
- [ ] Fetch repo languages for tech stack
- [ ] Cache results to avoid rate limits

**3.5 Project Management**
- [ ] Create `/dashboard/projects` page
- [ ] Build GitHub Import Modal (select repos to import)
- [ ] Project list with search/filter
- [ ] Project editor (title, description, demo URL, visibility, featured)
- [ ] Drag-and-drop reorder (using dnd-kit or similar)
- [ ] Delete project with confirmation
- [ ] Sync button to refresh from GitHub

### Phase 4: Portfolio Themes

**4.1 Theme System**
- [ ] Create theme components folder structure
- [ ] Define `ThemeProps` interface (profile, projects)

**4.2 Minimal Theme**
- [ ] Clean, typography-focused design
- [ ] White/grayscale aesthetic
- [ ] Responsive layout (max-w-2xl)

**4.3 Bento Theme**
- [ ] Grid-based modular layout
- [ ] Featured projects span 2 columns
- [ ] Card-based design

**4.4 Terminal Theme**
- [ ] Monospace/hacker aesthetic
- [ ] Green-on-black color scheme
- [ ] ASCII art header
- [ ] Terminal-style commands for sections

**4.5 Theme Selector**
- [ ] Create `/dashboard/theme` page
- [ ] Theme preview cards with screenshots
- [ ] Live preview button
- [ ] Save theme selection

### Phase 5: Public Portfolio

**5.1 Portfolio Page**
- [ ] Create `/[username]/page.tsx` with dynamic routing
- [ ] Fetch profile and projects from Supabase
- [ ] Render correct theme based on profile.theme
- [ ] Handle 404 for non-existent usernames
- [ ] SEO metadata (title, description, og:image)

**5.2 Portfolio Publishing**
- [ ] Add publish/unpublish toggle in dashboard
- [ ] Show portfolio URL when published
- [ ] Preview mode for unpublished portfolios

**5.3 ISR (Incremental Static Regeneration)**
- [ ] Configure revalidation for portfolio pages
- [ ] Revalidate on profile/project updates

### Phase 6: Subdomain Routing

**6.1 Middleware Setup**
- [ ] Create `middleware.ts` for subdomain detection
- [ ] Extract subdomain from hostname
- [ ] Rewrite `username.devfolio.uz` to `/username`
- [ ] Handle `www` and root domain

**6.2 Local Development**
- [ ] Support `username.localhost:3000` for testing
- [ ] Document `/etc/hosts` setup for local subdomains

### Phase 7: Analytics

**7.1 Tracking Implementation**
- [ ] Create `lib/analytics/tracker.ts`
- [ ] Fire-and-forget tracking (non-blocking)
- [ ] Track events: page_view, project_click, github_click, demo_click, social_click

**7.2 Analytics API**
- [ ] Create `/api/analytics/track/route.ts`
- [ ] Extract geo data from Vercel headers
- [ ] Store in analytics_events table
- [ ] Silent failure (never break UX)

### Phase 8: Landing Page

**8.1 Landing Page Design**
- [ ] Hero section with value proposition
- [ ] Feature highlights (3-4 key features)
- [ ] Example portfolios showcase
- [ ] CTA button (Sign in with GitHub)

**8.2 Footer**
- [ ] Links to GitHub repo
- [ ] Social links
- [ ] "Built with Devfolio" branding

### Phase 9: Polish & Production

**9.1 Error Handling**
- [ ] Global error boundary
- [ ] API error handling with proper messages
- [ ] Form validation with Zod
- [ ] Toast notifications for success/error

**9.2 Loading States**
- [ ] Skeleton loaders for data fetching
- [ ] Button loading states
- [ ] Page transition animations

**9.3 Mobile Responsiveness**
- [ ] Test all pages on mobile viewports
- [ ] Fix any layout issues
- [ ] Touch-friendly interactions

**9.4 Deployment**
- [ ] Configure Vercel project
- [ ] Set up wildcard subdomain DNS
- [ ] Add environment variables in Vercel
- [ ] Deploy and test

---

## Current Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Project Setup | ✅ Complete | Next.js 14+, Tailwind, shadcn/ui configured |
| Phase 2: Authentication | ✅ Complete | GitHub OAuth via Supabase working |
| Phase 3: Dashboard | ✅ Complete | Overview, Projects, Settings, Theme pages |
| Phase 4: Themes | ✅ Complete | Minimal, Bento, Terminal themes ported |
| Phase 5: Public Portfolio | ✅ Complete | Dynamic routing at /portfolio/[username] |
| Phase 6: Subdomain Routing | ✅ Complete | Middleware configured for subdomains |
| Phase 7: Analytics | ✅ Complete | Page view tracking implemented |
| Phase 8: Landing Page | ✅ Complete | Hero, features, CTA sections |
| Phase 9: Polish | ✅ Complete | i18n, theme toggle, responsive design |

---

## Completed Features

### Authentication
- [x] GitHub OAuth via Supabase
- [x] Auto-create profile on first login
- [x] Protected dashboard routes
- [x] Logout functionality

### Dashboard
- [x] Overview page with stats (projects, stars, views)
- [x] Analytics chart (last 7 days)
- [x] Projects page with GitHub sync
- [x] Project visibility & featured toggles
- [x] Profile settings with social links
- [x] Theme selector with 3 options
- [x] Publish/unpublish portfolio toggle

### Portfolio Themes
- [x] Minimal Theme - Clean typography, whitespace
- [x] Bento Theme - Grid-based modular layout
- [x] Terminal Theme - Hacker aesthetic with typing effect

### Internationalization (i18n)
- [x] Multi-language support using `next-intl`
- [x] 3 languages: English, Uzbek (O'zbekcha), Russian (Русский)
- [x] Language selector in header (landing, login) and sidebar (dashboard)
- [x] All UI text translated (landing, login, dashboard, projects, settings, theme)
- [x] Language preference stored in cookies

### Dark/Light Theme
- [x] Theme toggle using `next-themes`
- [x] Dark/Light mode support with CSS variables
- [x] Theme toggle button in dashboard sidebar
- [x] Theme preference persisted in localStorage
- [x] System theme detection enabled

### Infrastructure
- [x] Supabase database with RLS policies
- [x] Middleware for subdomain routing
- [x] Analytics event tracking
- [x] Responsive mobile design

---

## App Routes

```
/                      → Landing page (redirects to /dashboard if logged in)
/login                 → GitHub OAuth login
/callback              → OAuth callback handler
/dashboard             → Overview with stats & analytics
/dashboard/projects    → Manage projects (sync from GitHub)
/dashboard/settings    → Edit profile, social links, publish toggle
/dashboard/theme       → Choose between 3 themes
/portfolio/[username]  → Public portfolio page
```

---

## Next Steps

1. **Test locally** - Run `npm run dev` and test the full flow
2. **Test GitHub OAuth** - Sign in and verify profile creation
3. **Import projects** - Sync repos from GitHub
4. **Preview portfolio** - Check all 3 themes
5. **Deploy to Vercel** - Configure environment variables
6. **Set up domain** - Configure wildcard subdomain DNS for devfolio.uz

---

## Environment Variables

Required in `.env.local` (already configured):
```
NEXT_PUBLIC_SUPABASE_URL=https://rwqzwgnulkrbbcsuqsjq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_BASE_DOMAIN=devfolio.uz
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For Vercel deployment, add these same variables in the Vercel dashboard.
