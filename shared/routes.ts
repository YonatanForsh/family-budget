import { z } from 'zod';
import { insertCategorySchema, insertExpenseSchema, insertSettingsSchema, categories, expenses, settings } from './schema';

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
  }),
};

export const api = {
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: {
        201: z.custom<typeof categories.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/categories/:id' as const,
      input: insertCategorySchema.partial(),
      responses: {
        200: z.custom<typeof categories.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/categories/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    moveBudget: {
      method: 'POST' as const,
      path: '/api/categories/move-budget' as const,
      input: z.object({
        fromCategoryId: z.number(),
        toCategoryId: z.number(),
        amount: z.number().positive(),
      }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    }
  },
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses' as const,
      input: z.object({
        month: z.string().optional(), // YYYY-MM
        categoryId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof expenses.$inferSelect & { categoryName?: string | null }>()), // enriched with category name
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses' as const,
      input: insertExpenseSchema,
      responses: {
        201: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/expenses/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  stats: {
    monthly: {
      method: 'GET' as const,
      path: '/api/stats/monthly' as const,
      input: z.object({
        month: z.string().optional(), // YYYY-MM
      }).optional(),
      responses: {
        200: z.object({
          totalBudget: z.number(),
          totalSpent: z.number(),
          remaining: z.number(),
          categories: z.array(z.custom<typeof categories.$inferSelect & { spent: number; remaining: number }>()),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  shopping: {
    list: {
      method: 'GET' as const,
      path: '/api/shopping' as const,
    },
    createList: {
      method: 'POST' as const,
      path: '/api/shopping' as const,
    },
    deleteList: {
      method: 'DELETE' as const,
      path: '/api/shopping/:id' as const,
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/shopping/:listId/items' as const,
    },
    updateItem: {
      method: 'PATCH' as const,
      path: '/api/shopping/items/:id' as const,
    },
    deleteItem: {
      method: 'DELETE' as const,
      path: '/api/shopping/items/:id' as const,
    },
  },
};

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

export type CategoryInput = z.infer<typeof api.categories.create.input>;
export type ExpenseInput = z.infer<typeof api.expenses.create.input>;
export type SettingsInput = z.infer<typeof api.settings.update.input>;
export type MoveBudgetInput = z.infer<typeof api.categories.moveBudget.input>;
