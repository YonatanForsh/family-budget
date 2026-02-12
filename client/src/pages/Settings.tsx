import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/hooks/use-budget";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  const [resetDay, setResetDay] = useState(1);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-3xl font-bold mb-8">הגדרות</h2>
        
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
      </main>
    </div>
  );
}