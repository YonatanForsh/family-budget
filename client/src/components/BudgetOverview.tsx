import { useMonthlyStats } from "@/hooks/use-budget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

export function BudgetOverview() {
  const { data: stats, isLoading } = useMonthlyStats();

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] rounded-2xl" />;
  }

  if (!stats) return null;

  // Calculate percentage
  const percentage = stats.totalBudget > 0 
    ? Math.min(Math.round((stats.totalSpent / stats.totalBudget) * 100), 100) 
    : 0;
  
  const isOverBudget = stats.totalSpent > stats.totalBudget;
  const remainingPercentage = Math.max(0, 100 - percentage);

  const data = [
    { name: "נוצל", value: stats.totalSpent, color: isOverBudget ? "#ef4444" : "#8b5cf6" },
    { name: "נותר", value: Math.max(0, stats.remaining), color: "#e2e8f0" },
  ];

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-primary font-bold flex justify-between items-center">
          <span>מצב התקציב החודשי</span>
          <span className="text-sm font-normal text-muted-foreground bg-white/50 px-3 py-1 rounded-full border border-purple-100">
            {new Date().toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-[200px] w-full relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                   startAngle={90}
                   endAngle={-270}
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                   ))}
                 </Pie>
                 <Tooltip 
                    formatter={(value: number) => `₪${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-black text-foreground">{percentage}%</span>
               <span className="text-xs text-muted-foreground">נוצל</span>
             </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-black/20 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-white/5">
                <div className="text-sm text-muted-foreground mb-1">סך הכל תקציב</div>
                <div className="text-2xl font-bold text-foreground">₪{Number(stats.totalBudget).toLocaleString()}</div>
              </div>
              <div className="bg-white dark:bg-black/20 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-white/5">
                <div className="text-sm text-muted-foreground mb-1">סך הכל הוצאות</div>
                <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-primary'}`}>
                  ₪{Number(stats.totalSpent).toLocaleString()}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-center gap-3 ${isOverBudget ? 'bg-red-50 text-red-700 dark:bg-red-900/20' : 'bg-green-50 text-green-700 dark:bg-green-900/20'}`}>
              {isOverBudget ? (
                <AlertCircle className="h-8 w-8 shrink-0" />
              ) : (
                <TrendingUp className="h-8 w-8 shrink-0" />
              )}
              <div>
                <div className="font-bold">{isOverBudget ? "חריגה מהתקציב!" : "כל הכבוד!"}</div>
                <div className="text-sm opacity-90">
                  {isOverBudget 
                    ? `חרגת ב-₪${(stats.totalSpent - stats.totalBudget).toLocaleString()}. כדאי להעביר תקציב מקטגוריה אחרת.` 
                    : `נותרו לך ₪${stats.remaining.toLocaleString()} להוצאות החודש.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
