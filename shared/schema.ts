import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // Link to Replit Auth user
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  location: text("location"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  telegramUrl: text("telegram_url"),
  twitterUrl: text("twitter_url"),
  websiteUrl: text("website_url"),
  theme: text("theme").default("minimal").notNull(), // 'minimal', 'bento', 'terminal'
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(), // FK to profiles.id
  githubRepoId: text("github_repo_id"), // Store as text to be safe with bigints
  title: text("title").notNull(),
  description: text("description"),
  longDescription: text("long_description"),
  githubUrl: text("github_url"),
  demoUrl: text("demo_url"),
  imageUrl: text("image_url"),
  techStack: text("tech_stack").array(), // Array of strings
  stars: integer("stars").default(0),
  forks: integer("forks").default(0),
  isVisible: boolean("is_visible").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  eventType: text("event_type").notNull(), // 'page_view', 'project_click', etc.
  projectId: integer("project_id"), // Optional
  visitorCountry: text("visitor_country"),
  visitorCity: text("visitor_city"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === RELATIONS ===

export const profilesRelations = relations(profiles, ({ many }) => ({
  projects: many(projects),
  analyticsEvents: many(analyticsEvents),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [projects.profileId],
    references: [profiles.id],
  }),
  analyticsEvents: many(analyticsEvents),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  profile: one(profiles, {
    fields: [analyticsEvents.profileId],
    references: [profiles.id],
  }),
  project: one(projects, {
    fields: [analyticsEvents.projectId],
    references: [projects.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertProfileSchema = createInsertSchema(profiles).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertProjectSchema = createInsertSchema(projects).omit({ 
  id: true, 
  profileId: true, 
  createdAt: true, 
  updatedAt: true,
  lastSyncedAt: true
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true
});

// === EXPLICIT API CONTRACT TYPES ===

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

// Request types
export type UpdateProfileRequest = Partial<InsertProfile>;
export type UpdateProjectRequest = Partial<InsertProject>;
export type SyncProjectsRequest = { githubUsername: string; githubToken?: string }; // Simple sync for MVP

// Response types
export type ProfileResponse = Profile & { projects?: Project[] };
export type ProjectResponse = Project;

export * from "./models/auth";
