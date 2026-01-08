// Waitlist interests stored in profile.custom_data
export interface WaitlistInterests {
  analytics?: boolean;
  custom_domain?: boolean;
  requested_domain?: string;
  joined_at?: string;
}

// Custom data stored in profile
export interface ProfileCustomData {
  waitlist_interests?: WaitlistInterests;
}

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
  custom_data: ProfileCustomData | null;
  custom_domain: string | null;
  custom_domain_verified: boolean;
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

// Analytics event types
export type AnalyticsEventType =
  | "page_view"
  | "project_click"
  | "github_click"
  | "demo_click"
  | "social_click"
  | "resume_download"
  | "project_interaction"
  | "filter_click";

// Analytics event metadata
export interface AnalyticsMetadata {
  referrer_type?: "linkedin" | "greenhouse" | "lever" | "workday" | "telegram" | "direct" | "other";
  duration_seconds?: number;
  project_title?: string;
  button_location?: string;
  [key: string]: string | number | boolean | undefined;
}

// Analytics event type
export interface AnalyticsEvent {
  id: number;
  profile_id: string;
  visitor_session_id: string | null;
  event_type: AnalyticsEventType;
  project_id: string | null;
  metadata: AnalyticsMetadata | null;
  visitor_country: string | null;
  visitor_city: string | null;
  geo_country: string | null;
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
  isOwner?: boolean;
  isPreview?: boolean;
  geoCountry?: string | null;
}
