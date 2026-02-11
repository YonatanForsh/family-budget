import { useExpenses, useDeleteExpense } from "@/hooks/use-budget";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentExpenses() {
  const { data: expenses, isLoading } = useExpenses();
  const deleteExpense = useDeleteExpense();

  if (isLoading) return <Skeleton className="w-full h-[300px] rounded-2xl" />;

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">הוצאות אחרונות</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses && expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">תיאור</TableHead>
                  <TableHead className="text-right">קטגוריה</TableHead>
                  <TableHead className="text-left">סכום</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0, 10).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {format(new Date(expense.date), "dd/MM/yy", { locale: he })}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      {expense.categoryName ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary-foreground">
                          {expense.categoryName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">כללי</span>
                      )}
                    </TableCell>
                    <TableCell className="text-left font-bold ltr">
                      ₪{Number(expense.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>למחוק הוצאה?</AlertDialogTitle>
                            <AlertDialogDescription>הפעולה תסיר את ההוצאה מהחישוב החודשי.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteExpense.mutate(expense.id)} className="bg-destructive">מחק</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            עדיין אין הוצאות החודש. לחץ על הפלוס כדי להתחיל!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
