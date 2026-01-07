import { z } from 'zod';
import { insertProfileSchema, insertProjectSchema, insertAnalyticsEventSchema, profiles, projects } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile', // Get current user's profile
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/profile',
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    getByUsername: {
      method: 'GET' as const,
      path: '/api/portfolio/:username', // Public portfolio data
      responses: {
        200: z.custom<typeof profiles.$inferSelect & { projects: typeof projects.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    }
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/projects/:id',
      input: insertProjectSchema.partial(),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    sync: {
      method: 'POST' as const,
      path: '/api/projects/sync',
      input: z.object({
        githubUsername: z.string(),
        githubToken: z.string().optional(),
      }),
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal
      }
    }
  },
  analytics: {
    track: {
      method: 'POST' as const,
      path: '/api/analytics',
      input: insertAnalyticsEventSchema,
      responses: {
        201: z.void(),
      }
    }
  }
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type ProfileInput = z.infer<typeof api.profile.update.input>;
export type ProjectInput = z.infer<typeof api.projects.create.input>;
export type SyncInput = z.infer<typeof api.projects.sync.input>;
export type AnalyticsInput = z.infer<typeof api.analytics.track.input>;
