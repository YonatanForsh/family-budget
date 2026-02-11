export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  budgetLimit: numeric("budget_limit").notNull(), // stored as string in JS, numeric in DB
  color: text("color").notNull().default("#3b82f6"), // Hex color
  userId: varchar("user_id").notNull().references(() => users.id),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  categoryId: integer("category_id").references(() => categories.id), // Can be null if general? Let's say required for now or null for "General"
  userId: varchar("user_id").notNull().references(() => users.id),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  resetDay: integer("reset_day").notNull().default(1),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertCategorySchema = createInsertSchema(categories)
  .omit({ id: true, userId: true })
  .extend({
    budgetLimit: z.number().or(z.string().regex(/^\d+(\.\d{1,2})?$/)), // Accept number or numeric string
  });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true, userId: true })
  .extend({
    amount: z.number().or(z.string().regex(/^\-?\d+(\.\d{1,2})?$/)),
    categoryId: z.number().nullable().optional(), // allow null or undefined
    date: z.coerce.date(), // Ensure date string is parsed
  });

export const insertSettingsSchema = createInsertSchema(settings)
  .omit({ id: true, userId: true });


// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// API Types
export type MonthlyStats = {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categories: (Category & { spent: number; remaining: number })[];
};

export type MoveBudgetRequest = {
  fromCategoryId: number;
  toCategoryId: number;
  amount: number;
};
