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
  lastResetDate: timestamp("last_reset_date"), // Track when the last reset happened
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
});

export const fixedExpenses = pgTable("fixed_expenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: numeric("amount").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  userId: varchar("user_id").notNull().references(() => users.id),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  userId: varchar("user_id").notNull().references(() => users.id),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: text("amount"), // text to allow "1 unit", "2 kg", etc.
  isCompleted: boolean("is_completed").notNull().default(false),
  listId: integer("list_id").notNull().references(() => shoppingLists.id),
});

export const budgetHistory = pgTable("budget_history", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(), // YYYY-MM
  totalBudget: numeric("total_budget").notNull(),
  totalSpent: numeric("total_spent").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
  fixedExpenses: many(fixedExpenses),
}));

export const fixedExpensesRelations = relations(fixedExpenses, ({ one }) => ({
  user: one(users, {
    fields: [fixedExpenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [fixedExpenses.categoryId],
    references: [categories.id],
  }),
}));

export const shoppingListsRelations = relations(shoppingLists, ({ one, many }) => ({
  user: one(users, {
    fields: [shoppingLists.userId],
    references: [users.id],
  }),
  items: many(shoppingListItems),
}));

export const shoppingListItemsRelations = relations(shoppingListItems, ({ one }) => ({
  list: one(shoppingLists, {
    fields: [shoppingListItems.listId],
    references: [shoppingLists.id],
  }),
}));

export const budgetHistoryRelations = relations(budgetHistory, ({ one }) => ({
  user: one(users, {
    fields: [budgetHistory.userId],
    references: [users.id],
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
  .omit({ id: true, userId: true, lastResetDate: true });

export const insertFixedExpenseSchema = createInsertSchema(fixedExpenses)
  .omit({ id: true, userId: true })
  .extend({
    amount: z.number().or(z.string().regex(/^\d+(\.\d{1,2})?$/)),
  });

export const insertShoppingListSchema = createInsertSchema(shoppingLists)
  .omit({ id: true, userId: true });

export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems)
  .omit({ id: true });

export const insertBudgetHistorySchema = createInsertSchema(budgetHistory)
  .omit({ id: true });


// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type FixedExpense = typeof fixedExpenses.$inferSelect;
export type InsertFixedExpense = z.infer<typeof insertFixedExpenseSchema>;

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;

export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = z.infer<typeof insertShoppingListItemSchema>;

export type BudgetHistory = typeof budgetHistory.$inferSelect;
export type InsertBudgetHistory = z.infer<typeof insertBudgetHistorySchema>;

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
