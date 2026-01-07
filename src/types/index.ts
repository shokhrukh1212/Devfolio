// Profile type
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  telegram_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  theme: "minimal" | "bento" | "terminal";
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Project type
export interface Project {
  id: string;
  profile_id: string;
  github_repo_id: number | null;
  title: string;
  description: string | null;
  long_description: string | null;
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  tech_stack: string[];
  stars: number;
  forks: number;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

// Analytics event type
export interface AnalyticsEvent {
  id: number;
  profile_id: string;
  event_type: "page_view" | "project_click" | "github_click" | "demo_click" | "social_click";
  project_id: string | null;
  visitor_country: string | null;
  visitor_city: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

// GitHub repo type (from GitHub API)
export interface GitHubRepo {
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

// Theme types
export type ThemeName = "minimal" | "bento" | "terminal";

export interface ThemeProps {
  profile: Profile;
  projects: Project[];
}
