import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, useUpdateSettings, useCategories } from "@/hooks/use-budget";
import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FixedExpense } from "@shared/schema";

export default function Settings() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: categories } = useCategories();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  const [resetDay, setResetDay] = useState(1);

  const { data: fixedExpenses, isLoading: fixedLoading } = useQuery<FixedExpense[]>({
    queryKey: ["/api/fixed-expenses"],
  });

  const [newFixedName, setNewFixedName] = useState("");
  const [newFixedAmount, setNewFixedAmount] = useState("");
  const [newFixedCategory, setNewFixedCategory] = useState("");

  useEffect(() => {
    if (settings?.resetDay) {
      setResetDay(settings.resetDay);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({ resetDay });
      toast({
        title: "הגדרות נשמרו",
        description: "יום איפוס התקציב עודכן בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לשמור את ההגדרות",
        variant: "destructive",
      });
    }
  };

  const createFixedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/fixed-expenses", {
        name: newFixedName,
        amount: newFixedAmount,
        categoryId: parseInt(newFixedCategory)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-expenses"] });
      setNewFixedName("");
      setNewFixedAmount("");
      setNewFixedCategory("");
      toast({ title: "הוצאה קבועה נוספה" });
    }
  });

  const deleteFixedMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/fixed-expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-expenses"] });
      toast({ title: "הוצאה קבועה נמחקה" });
    }
  });

  if (settingsLoading || fixedLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        <h2 className="text-3xl font-bold">הגדרות</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>ניהול תקציב</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resetDay">יום איפוס חודשי (1-31)</Label>
              <Input
                id="resetDay"
                type="number"
                min="1"
                max="31"
                value={resetDay}
                onChange={(e) => setResetDay(parseInt(e.target.value))}
                className="text-right"
              />
              <p className="text-sm text-muted-foreground">
                היום בחודש בו התקציב מתאפס ומתחיל חישוב חדש.
              </p>
            </div>

            <Button onClick={handleSave} disabled={updateSettings.isPending} className="w-full gap-2">
              {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              שמור הגדרות
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>הוצאות קבועות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  placeholder="שם ההוצאה" 
                  value={newFixedName} 
                  onChange={e => setNewFixedName(e.target.value)}
                  className="text-right"
                />
                <Input 
                  placeholder="סכום (₪)" 
                  type="number" 
                  value={newFixedAmount} 
                  onChange={e => setNewFixedAmount(e.target.value)}
                  className="text-right"
                />
              </div>
              <Select value={newFixedCategory} onValueChange={setNewFixedCategory}>
                <SelectTrigger dir="rtl"><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
                <SelectContent dir="rtl">
                  {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => createFixedMutation.mutate()} disabled={!newFixedName || !newFixedAmount || !newFixedCategory || createFixedMutation.isPending}>
                <Plus className="w-4 h-4 ml-2" />
                הוסף הוצאה קבועה
              </Button>
            </div>

            <div className="space-y-2">
              {fixedExpenses?.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <span className="font-bold">{expense.name}</span>
                    <span className="mr-2 text-primary font-medium">₪{Number(expense.amount).toLocaleString()}</span>
                    <span className="mr-2 text-xs text-muted-foreground">({categories?.find(c => c.id === expense.categoryId)?.name})</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteFixedMutation.mutate(expense.id)} className="text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}