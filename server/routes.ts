import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Categories
  app.get(api.categories.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    let categories = await storage.getCategories(userId);
    
    if (categories.length === 0) {
      // Seed default categories for new user
      const defaults = [
        { name: "שכר דירה", budgetLimit: "4000", color: "#ef4444" }, // Red
        { name: "מזון", budgetLimit: "2500", color: "#f97316" }, // Orange
        { name: "חשבונות", budgetLimit: "1000", color: "#eab308" }, // Yellow
        { name: "דלק/תחבורה", budgetLimit: "800", color: "#22c55e" }, // Green
        { name: "בילויים", budgetLimit: "500", color: "#a855f7" }, // Purple
      ];
      
      for (const def of defaults) {
        await storage.createCategory({ ...def, userId });
      }
      categories = await storage.getCategories(userId);
    }
    
    res.json(categories);
  });

  app.post(api.categories.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.categories.create.input.parse(req.body);
      const category = await storage.createCategory({ ...input, userId });
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.categories.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.categories.update.input.parse(req.body);
      const category = await storage.updateCategory(id, input);
      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.categories.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteCategory(id);
    res.status(204).send();
  });

  app.post(api.categories.moveBudget.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.categories.moveBudget.input.parse(req.body);
      await storage.moveBudget(input.fromCategoryId, input.toCategoryId, input.amount);
      res.json({ success: true, message: "Budget moved successfully" });
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(400).json({ message: (err as Error).message });
    }
  });

  // Expenses
  app.get(api.expenses.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const filter = {
      month: req.query.month as string | undefined,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined
    };
    const expenses = await storage.getExpenses(userId, filter);
    res.json(expenses);
  });

  app.post(api.expenses.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      // Manually handle date coercion if needed, but schema has z.coerce.date()
      const input = api.expenses.create.input.parse(req.body);
      const expense = await storage.createExpense({ ...input, userId });
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.expenses.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteExpense(id);
    res.status(204).send();
  });

  // Settings
  app.get(api.settings.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const settings = await storage.getSettings(userId);
    res.json(settings || {}); // Return empty object if no settings yet
  });

  app.put(api.settings.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(userId, input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Stats
  app.get(api.stats.monthly.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const month = req.query.month as string | undefined;
    const stats = await storage.getMonthlyStats(userId, month);
    res.json(stats);
  });

  // Shopping Lists
  app.get('/api/shopping', isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const lists = await storage.getShoppingLists(userId);
    res.json(lists);
  });

  app.post('/api/shopping', isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const list = await storage.createShoppingList({ ...req.body, userId });
    res.status(201).json(list);
  });

  app.delete('/api/shopping/:id', isAuthenticated, async (req, res) => {
    await storage.deleteShoppingList(Number(req.params.id));
    res.status(204).send();
  });

  app.post('/api/shopping/:listId/items', isAuthenticated, async (req, res) => {
    const item = await storage.createShoppingListItem({ ...req.body, listId: Number(req.params.listId) });
    res.status(201).json(item);
  });

  app.patch('/api/shopping/items/:id', isAuthenticated, async (req, res) => {
    const item = await storage.updateShoppingListItem(Number(req.params.id), req.body);
    res.json(item);
  });

  app.delete('/api/shopping/items/:id', isAuthenticated, async (req, res) => {
    await storage.deleteShoppingListItem(Number(req.params.id));
    res.status(204).send();
  });

  // Fixed Expenses
  app.get('/api/fixed-expenses', isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const expenses = await storage.getFixedExpenses(userId);
    res.json(expenses);
  });

  app.post('/api/fixed-expenses', isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const expense = await storage.createFixedExpense({ ...req.body, userId });
    res.status(201).json(expense);
  });

  app.delete('/api/fixed-expenses/:id', isAuthenticated, async (req, res) => {
    await storage.deleteFixedExpense(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
