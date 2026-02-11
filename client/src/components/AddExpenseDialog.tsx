import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { useCreateExpense, useCategories, useMonthlyStats } from "@/hooks/use-budget";
import { insertExpenseSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Messages
const motivationalMessages = [
  "נרשם! כל שקל שנשמר פה הוא שקל שיושקע בחלומות שלכם. 🌟",
  "אחלה עבודה! שליטה בתקציב היא הדרך הכי מהירה לחופש כלכלי. 💸",
  "נרשם במערכת. צמצום קטן פה, חופשה גדולה שם! 🏖️",
  "כל רישום מקרב אתכם ליעד השנתי. אלופים! 🏆",
  "המודעות שלכם היום היא השקט הנפשי שלכם מחר. 🧘‍♂️",
  "סחתין על המעקב! הידע הוא הכוח שלכם מול הבנק. 💪",
  "נרשם! זכרו: עושר לא נמדד בכמה מרוויחים, אלא בכמה שומרים. 💰",
  "עוד צעד קטן לניהול חכם. המשפחה שלכם תודה לכם! ❤️",
  "נהדר! אתם מנהלים את הכסף במקום שהוא ינהל אתכם. 🧭",
  "קיבלתי! הדיוק הזה משתלם, תרתי משמע. 📈",
  "יופי של רישום. כל טיפה בים יוצרת אוקיינוס של ביטחון. 🌊",
  "הבקרה הזו היא מה שמבדיל בין חלום לתכנית עבודה. 📋",
  "נרשם! אתם בדרך הנכונה לסיים את החודש בירוק. ✅",
  "כל הכבוד על האחריות! זה ממש לא מובן מאליו. ✨",
  "נרשם בהצלחה. המשמעת שלכם היום היא המתנה שלכם למחר. 🎁",
  "יש! עוד הוצאה תחת שליטה. אתם בוסים של הכסף שלכם. 😎",
  "נרשם. המשיכו ככה, הסטטיסטיקה לטובתכם! 📊",
  "עוד לבנה בחומה של היציבות הכלכלית שלכם. 🧱",
  "כל הכבוד! מעקב צמוד הוא סוד ההצלחה. 🤫",
  "נרשם! פשוט, קליל וחכם. בדיוק כמוכם. 🧠"
];

const comfortingMessages = [
  "חריגה קטנה, לא סוף העולם. מחר יום חדש של בחירות חכמות. 🌱",
  "אופס, חרגנו קצת... לא נורא! בשביל זה יש לנו קטגוריות אחרות ללוות מהן. 🤝",
  "קצת חרגנו הפעם, אבל המודעות שלכם היא הניצחון האמיתי. ממשיכים קדימה! 🧡",
  "החודש הזה קצת מאתגר, וזה בסדר. העיקר שאנחנו עם היד על הדופק. 💓",
  "אז הייתה חריגה... זה קורה גם למשפחות הכי מתוכננות. בואו ננסה לאזן בשבוע הבא. ⚖️",
  "אל תתנו למספר האדום להוריד אתכם. אתם לומדים את השטח וזה הכי חשוב. 💡",
  "חריגה היא רק הזדמנות לתכנן טוב יותר את החודש הבא. אנחנו יחד בזה! ✨",
  "אז הוצאנו קצת יותר, אבל אנחנו לא עוצרים. הדרך חשובה יותר מהמעידה. 🚀"
];

const formSchema = insertExpenseSchema.extend({
  amount: z.coerce.number().min(0.1, "הסכום חייב להיות גדול מ-0"),
  categoryId: z.coerce.number().optional().nullable(),
  date: z.coerce.date(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();
  const { data: stats } = useMonthlyStats();
  const createExpense = useCreateExpense();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "" as any,
      date: new Date(),
      categoryId: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createExpense.mutateAsync(data);
      setOpen(false);
      form.reset();

      // Determine which message to show
      let message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      let variant: "default" | "destructive" = "default";
      let title = "הוצאה נוספה!";

      // Check if this expense caused an over-budget situation
      if (data.categoryId && stats?.categories) {
        const category = stats.categories.find(c => c.id === data.categoryId);
        if (category && (Number(category.spent) + Number(data.amount) > Number(category.budgetLimit))) {
           message = comfortingMessages[Math.floor(Math.random() * comfortingMessages.length)];
           title = "שים לב: חריגה מהתקציב";
           // We don't make it red (destructive) to keep it comforting, maybe just default style
        }
      }

      toast({
        title,
        description: message,
        variant,
        duration: 5000,
      });

    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה להוסיף את ההוצאה",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-l from-primary to-purple-600 text-white font-bold px-8">
          <Plus className="ml-2 h-5 w-5" />
          הוסף הוצאה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">הוספת הוצאה חדשה</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Input placeholder="על מה הוצאנו?" {...field} className="text-right" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סכום (₪)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} className="text-left ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>קטגוריה</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="w-full text-right" dir="rtl">
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        <SelectItem value="0">כללי (ללא קטגוריה)</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>תאריך</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: he })
                          ) : (
                            <span>בחר תאריך</span>
                          )}
                          <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={he}
                        dir="rtl"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
              <Button type="submit" disabled={createExpense.isPending} className="bg-primary hover:bg-primary/90">
                {createExpense.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "שמור הוצאה"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
