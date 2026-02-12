import { useState } from "react";
import { useCategories, useMonthlyStats, useDeleteCategory, useCreateCategory, useUpdateCategory, useMoveBudget } from "@/hooks/use-budget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Edit2, Trash2, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Category } from "@shared/schema";
import { cn } from "@/lib/utils";

// Category Colors for selection
const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", 
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"
];

function CategoryItem({ category }: { category: Category & { spent: number; remaining: number } }) {
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const percentage = Math.min(100, Math.round((Number(category.spent) / Number(category.budgetLimit)) * 100));
  const isOverBudget = Number(category.spent) > Number(category.budgetLimit);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editLimit, setEditLimit] = useState(category.budgetLimit);
  const [editColor, setEditColor] = useState(category.color);

  const handleUpdate = async () => {
    await updateCategory.mutateAsync({
      id: category.id,
      name: editName,
      budgetLimit: editLimit.toString(),
      color: editColor
    });
    setIsEditOpen(false);
  };

  return (
    <div className="bg-card hover:bg-accent/5 transition-colors p-4 rounded-xl border border-border/50 shadow-sm mb-4 group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: category.color }} />
          <h3 className="font-bold text-lg">{category.name}</h3>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
             <DialogTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
             </DialogTrigger>
             <DialogContent dir="rtl">
               <DialogHeader><DialogTitle>עריכת קטגוריה</DialogTitle></DialogHeader>
               <div className="grid gap-4 py-4">
                 <div className="grid gap-2">
                   <Label>שם קטגוריה</Label>
                   <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                 </div>
                 <div className="grid gap-2">
                   <Label>תקציב חודשי</Label>
                   <Input type="number" value={editLimit} onChange={(e) => setEditLimit(e.target.value)} />
                 </div>
                 <div className="grid gap-2">
                   <Label>צבע</Label>
                   <div className="flex flex-wrap gap-2">
                     {COLORS.map(c => (
                       <button
                         key={c}
                         onClick={() => setEditColor(c)}
                         className={cn(
                           "w-6 h-6 rounded-full transition-transform hover:scale-110",
                           editColor === c && "ring-2 ring-offset-2 ring-primary scale-110"
                         )}
                         style={{ backgroundColor: c }}
                       />
                     ))}
                   </div>
                 </div>
                 <Button onClick={handleUpdate} disabled={updateCategory.isPending}>שמור שינויים</Button>
               </div>
             </DialogContent>
           </Dialog>

           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
             </AlertDialogTrigger>
             <AlertDialogContent dir="rtl">
               <AlertDialogHeader>
                 <AlertDialogTitle>אתה בטוח?</AlertDialogTitle>
                 <AlertDialogDescription>פעולה זו תמחק את הקטגוריה. כל ההוצאות המשויכות יהפכו ל-"ללא קטגוריה".</AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>ביטול</AlertDialogCancel>
                 <AlertDialogAction onClick={() => deleteCategory.mutate(category.id)} className="bg-destructive hover:bg-destructive/90">מחק</AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
        </div>
      </div>
      
      <div className="flex justify-between text-sm mb-1 text-muted-foreground">
        <span>₪{Number(category.spent).toLocaleString()} מתוך ₪{Number(category.budgetLimit).toLocaleString()}</span>
        <span className={cn(isOverBudget && "text-destructive font-bold")}>{percentage}%</span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2.5 bg-secondary/20" 
        indicatorClassName={cn(
          percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-orange-500" : "bg-green-500"
        )}
      />
      
      {isOverBudget && (
        <p className="text-xs text-destructive mt-1 font-medium">חריגה של ₪{(Number(category.spent) - Number(category.budgetLimit)).toLocaleString()}</p>
      )}
    </div>
  );
}

function MoveBudgetDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const moveBudget = useMoveBudget();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");

  const handleMove = async () => {
    if (!fromId || !toId || !amount) return;
    await moveBudget.mutateAsync({
      fromCategoryId: Number(fromId),
      toCategoryId: Number(toId),
      amount: Number(amount)
    });
    setOpen(false);
    setAmount("");
    setFromId("");
    setToId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          העבר תקציב
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>איזון תקציב חכם ⚖️</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>מאיפה להעביר?</Label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger dir="rtl"><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
              <SelectContent dir="rtl">
                {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>לאן להעביר?</Label>
            <Select value={toId} onValueChange={setToId}>
              <SelectTrigger dir="rtl"><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
              <SelectContent dir="rtl">
                {categories.filter(c => c.id.toString() !== fromId).map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>סכום להעברה (₪)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <Button onClick={handleMove} disabled={moveBudget.isPending} className="mt-2 w-full">בצע העברה</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const createCategory = useCreateCategory();
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [color, setColor] = useState(COLORS[6]);

  const handleCreate = async () => {
    if (!name || !limit) return;
    await createCategory.mutateAsync({
      name,
      budgetLimit: limit,
      color
    });
    setOpen(false);
    setName("");
    setLimit("");
    setColor(COLORS[6]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground shadow-md hover:shadow-lg">
          <Plus className="w-4 h-4" />
          קטגוריה חדשה
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת קטגוריה חדשה</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>שם קטגוריה</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="למשל: סופרמרקט" />
          </div>
          <div className="grid gap-2">
            <Label>תקציב חודשי (₪)</Label>
            <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0.00" />
          </div>
          <div className="grid gap-2">
            <Label>צבע</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform hover:scale-110",
                    color === c && "ring-2 ring-offset-2 ring-primary scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={createCategory.isPending} className="mt-2 w-full">צור קטגוריה</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryList() {
  const { data: stats, isLoading } = useMonthlyStats();
  
  if (isLoading) return <div>טוען קטגוריות...</div>;
  if (!stats) return <div>אין נתונים</div>;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">קטגוריות</CardTitle>
        <div className="flex gap-2">
          <MoveBudgetDialog categories={stats.categories} />
          <CreateCategoryDialog />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          {stats.categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              עדיין אין קטגוריות. צור את הקטגוריה הראשונה שלך!
            </div>
          ) : (
            stats.categories.map(category => (
              <CategoryItem key={category.id} category={category} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
