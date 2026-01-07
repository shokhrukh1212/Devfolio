import { db } from "./db";
import {
  profiles, projects, analyticsEvents,
  type Profile, type InsertProfile, type UpdateProfileRequest,
  type Project, type InsertProject, type UpdateProjectRequest,
  type AnalyticsEvent, type InsertAnalyticsEvent
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByUserId(userId: number): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  createProfile(userId: number, profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, updates: UpdateProfileRequest): Promise<Profile>;

  // Projects
  getProjects(profileId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: UpdateProjectRequest): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Analytics
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
}

export class DatabaseStorage implements IStorage {
  // Profiles
  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileByUserId(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.username, username));
    return profile;
  }

  async createProfile(userId: number, profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values({ ...profile, userId }).returning();
    return newProfile;
  }

  async updateProfile(id: number, updates: UpdateProfileRequest): Promise<Profile> {
    const [updated] = await db.update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return updated;
  }

  // Projects
  async getProjects(profileId: number): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.profileId, profileId))
      .orderBy(projects.displayOrder);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, updates: UpdateProjectRequest): Promise<Project> {
    const [updated] = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Analytics
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [newEvent] = await db.insert(analyticsEvents).values(event).returning();
    return newEvent;
  }
}

export const storage = new DatabaseStorage();
