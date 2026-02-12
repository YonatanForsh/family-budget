import { useMonthlyStats } from "@/hooks/use-budget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

export function BudgetOverview() {
  const { data: stats, isLoading } = useMonthlyStats();

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] rounded-2xl" />;
  }

  if (!stats) return null;

  const totalSpent = Number(stats.totalSpent);
  const totalBudget = Number(stats.totalBudget);
  
  // Half-circle gauge logic
  // We want to show spending as a portion of the semi-circle
  // If we exceed budget, the gauge stays full but we show the total
  const percentage = totalBudget > 0 
    ? Math.round((totalSpent / totalBudget) * 100) 
    : 0;
  
  const displayPercentage = Math.min(percentage, 100);
  const isOverBudget = totalSpent > totalBudget;

  const data = [
    { name: "נוצל", value: displayPercentage, color: isOverBudget ? "#ef4444" : "#8b5cf6" },
    { name: "נותר", value: 100 - displayPercentage, color: "#e2e8f0" },
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
          <div className="h-[180px] w-full relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data}
                   cx="50%"
                   cy="80%"
                   innerRadius={80}
                   outerRadius={110}
                   startAngle={180}
                   endAngle={0}
                   paddingAngle={0}
                   dataKey="value"
                   stroke="none"
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute top-[60%] left-0 w-full flex flex-col items-center justify-center pointer-events-none">
               <span className={`text-4xl font-black ${isOverBudget ? 'text-red-500' : 'text-foreground'}`}>{percentage}%</span>
               <span className="text-sm text-muted-foreground font-medium">מהתקציב הכולל</span>
             </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-black/20 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-white/5">
                <div className="text-sm text-muted-foreground mb-1">סך הכל תקציב</div>
                <div className="text-2xl font-bold text-foreground">₪{totalBudget.toLocaleString()}</div>
              </div>
              <div className="bg-white dark:bg-black/20 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-white/5">
                <div className="text-sm text-muted-foreground mb-1">סך הכל הוצאות</div>
                <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-primary'}`}>
                  ₪{totalSpent.toLocaleString()}
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
                    ? `חרגת ב-₪${(totalSpent - totalBudget).toLocaleString()}. כדאי להעביר תקציב מקטגוריה אחרת.` 
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
