import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-none">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive font-bold text-2xl items-center justify-center">
            <AlertCircle className="h-8 w-8" />
            <h1>404 עמוד לא נמצא</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 text-center mb-6">
            אופס! נראה שהגעת למקום שלא קיים. אולי חיפשת את התקציב שלך? 😉
          </p>
          
          <div className="flex justify-center">
             <Link href="/">
               <Button className="w-full sm:w-auto">
                  חזרה למסך הבית
               </Button>
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
