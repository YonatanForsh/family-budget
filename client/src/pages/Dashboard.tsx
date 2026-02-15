import { Header } from "@/components/Header";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { BudgetOverview } from "@/components/BudgetOverview";
import { CategoryList } from "@/components/CategoryList";
import { RecentExpenses } from "@/components/RecentExpenses";
import { motion } from "framer-motion";
import * as React from "react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">לוח בקרה</h2>
            <p className="text-muted-foreground">תמונת מצב עדכנית של התקציב המשפחתי שלך</p>
          </div>
          <div className="fixed bottom-6 left-6 z-50 md:static">
             <AddExpenseDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <BudgetOverview />
            <RecentExpenses />
          </motion.div>

          {/* Sidebar / Categories Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <CategoryList />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
