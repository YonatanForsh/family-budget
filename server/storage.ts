import { 
  users, categories, expenses, settings,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Expense, type InsertExpense,
  type Settings, type InsertSettings,
  type MonthlyStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(userId: string): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory & { userId: string }): Promise<Category>;
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Expenses
  getExpenses(userId: string, filter?: { month?: string; categoryId?: number }): Promise<(Expense & { categoryName?: string | null })[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense & { userId: string }): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  
  // Settings
  getSettings(userId: string): Promise<Settings | undefined>;
  updateSettings(userId: string, updates: Partial<InsertSettings>): Promise<Settings>;
  
  // Stats
  getMonthlyStats(userId: string, month?: string): Promise<MonthlyStats>;
  
  // Budget Operations
  moveBudget(fromId: number, toId: number, amount: number): Promise<void>;
  // Shopping Lists
  getShoppingLists(userId: string): Promise<(ShoppingList & { items: ShoppingListItem[] })[]>;
  createShoppingList(list: InsertShoppingList & { userId: string }): Promise<ShoppingList>;
  deleteShoppingList(id: number): Promise<void>;
  updateShoppingListItem(id: number, updates: Partial<InsertShoppingListItem>): Promise<ShoppingListItem>;
  createShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem>;
  deleteShoppingListItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  // ... (rest of existing class) ...

  async getShoppingLists(userId: string): Promise<(ShoppingList & { items: ShoppingListItem[] })[]> {
    const lists = await db.select().from(shoppingLists).where(eq(shoppingLists.userId, userId));
    const results = [];
    for (const list of lists) {
      const items = await db.select().from(shoppingListItems).where(eq(shoppingListItems.listId, list.id));
      results.push({ ...list, items });
    }
    return results;
  }

  async createShoppingList(list: InsertShoppingList & { userId: string }): Promise<ShoppingList> {
    const [newList] = await db.insert(shoppingLists).values(list).returning();
    return newList;
  }

  async deleteShoppingList(id: number): Promise<void> {
    await db.delete(shoppingListItems).where(eq(shoppingListItems.listId, id));
    await db.delete(shoppingLists).where(eq(shoppingLists.id, id));
  }

  async updateShoppingListItem(id: number, updates: Partial<InsertShoppingListItem>): Promise<ShoppingListItem> {
    const [updated] = await db.update(shoppingListItems).set(updates).where(eq(shoppingListItems.id, id)).returning();
    return updated;
  }

  async createShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem> {
    const [newItem] = await db.insert(shoppingListItems).values(item).returning();
    return newItem;
  }

  async deleteShoppingListItem(id: number): Promise<void> {
    await db.delete(shoppingListItems).where(eq(shoppingListItems.id, id));
  }
}

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory & { userId: string }): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db.update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    // Should probably check for expenses first or cascade? 
    // For now, let's assume we can just delete and expenses become category-less or we restrict.
    // Drizzle relations don't enforce cascade delete automatically unless defined in DB.
    // Let's set expenses categoryId to null first (optional) or just delete.
    // If we delete category, expenses with that category ID might cause error if FK constraint exists.
    // Schema defines FK. So we should probably nullify expenses first.
    await db.update(expenses).set({ categoryId: null }).where(eq(expenses.categoryId, id));
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Expenses
  async getExpenses(userId: string, filter?: { month?: string; categoryId?: number }): Promise<(Expense & { categoryName?: string | null })[]> {
    let conditions = [eq(expenses.userId, userId)];
    
    if (filter?.categoryId) {
      conditions.push(eq(expenses.categoryId, filter.categoryId));
    }
    
    if (filter?.month) {
      const userSettings = await this.getSettings(userId);
      const resetDay = userSettings?.resetDay || 1;
      
      const [year, m] = filter.month.split('-').map(Number);
      const startDate = new Date(year, m - 1, resetDay);
      const endDate = new Date(year, m, resetDay);
      
      conditions.push(gte(expenses.date, startDate));
      conditions.push(lte(expenses.date, endDate));
    }

    const result = await db.select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      categoryId: expenses.categoryId,
      userId: expenses.userId,
      categoryName: categories.name
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(expenses.date));

    return result;
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(expense: InsertExpense & { userId: string }): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // Settings
  async getSettings(userId: string): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting;
  }

  async updateSettings(userId: string, updates: Partial<InsertSettings>): Promise<Settings> {
    const [updated] = await db.insert(settings)
      .values({ userId, ...updates } as any)
      .onConflictDoUpdate({
        target: settings.userId,
        set: updates,
      })
      .returning();
    return updated;
  }

  // Stats
  async getMonthlyStats(userId: string, month?: string): Promise<MonthlyStats> {
    const userSettings = await this.getSettings(userId);
    const resetDay = userSettings?.resetDay || 1;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    
    let startDate: Date;
    let endDate: Date;

    if (month) {
      // If a specific month is requested (YYYY-MM), we use the resetDay for that month
      const [year, m] = month.split('-').map(Number);
      startDate = new Date(year, m - 1, resetDay);
      endDate = new Date(year, m, resetDay);
    } else {
      // Logic for current budget cycle based on resetDay
      if (now.getDate() >= resetDay) {
        startDate = new Date(currentYear, currentMonth, resetDay);
        endDate = new Date(currentYear, currentMonth + 1, resetDay);
      } else {
        startDate = new Date(currentYear, currentMonth - 1, resetDay);
        endDate = new Date(currentYear, currentMonth, resetDay);
      }
    }

    // Get all categories
    const userCategories = await this.getCategories(userId);
    
    // Get expenses for the period
    const userExpenses = await db.select()
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      ));

    // Calculate totals
    const totalBudget = userCategories.reduce((sum, cat) => sum + Number(cat.budgetLimit), 0);
    const totalSpent = userExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const remaining = totalBudget - totalSpent;

    // Calculate per-category stats
    const categoriesStats = userCategories.map(cat => {
      const catExpenses = userExpenses.filter(exp => exp.categoryId === cat.id);
      const spent = catExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      return {
        ...cat,
        spent,
        remaining: Number(cat.budgetLimit) - spent
      };
    });

    return {
      totalBudget,
      totalSpent,
      remaining,
      categories: categoriesStats
    };
  }

  // Budget Operations
  async moveBudget(fromId: number, toId: number, amount: number): Promise<void> {
    // This should ideally be a transaction
    await db.transaction(async (tx) => {
      // Deduct from source
      // Need to read current limits first? 
      // Or just do SQL update decrement/increment.
      // Since budgetLimit is numeric string, we might need to cast or read-update.
      
      const [fromCat] = await tx.select().from(categories).where(eq(categories.id, fromId));
      const [toCat] = await tx.select().from(categories).where(eq(categories.id, toId));
      
      if (!fromCat || !toCat) throw new Error("Category not found");
      
      const newFromLimit = Number(fromCat.budgetLimit) - amount;
      const newToLimit = Number(toCat.budgetLimit) + amount;
      
      if (newFromLimit < 0) throw new Error("Insufficient funds in source category");
      
      await tx.update(categories)
        .set({ budgetLimit: newFromLimit.toString() })
        .where(eq(categories.id, fromId));
        
      await tx.update(categories)
        .set({ budgetLimit: newToLimit.toString() })
        .where(eq(categories.id, toId));
    });
  }
}

export const storage = new DatabaseStorage();
