import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wallet } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Right Side - Hero / Brand */}
      <div className="lg:w-1/2 relative bg-primary flex flex-col justify-between p-10 overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-900 opacity-90" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
               <Wallet className="w-8 h-8" />
             </div>
             <span className="text-2xl font-bold tracking-wider">FamilyBudget</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            ניהול תקציב <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-300">חכם ופשוט</span> <br />
            למשפחה
          </h1>
          
          <p className="text-lg md:text-xl text-purple-100 max-w-md leading-relaxed">
            הכלי המושלם לניהול הוצאות, מעקב אחרי יעדים והשגת חופש כלכלי. 
            פשוט, בעברית, ועם המון מוטיבציה.
          </p>
        </div>

        <div className="relative z-10 text-sm text-purple-200 mt-10">
          © 2024 כל הזכויות שמורות
        </div>
      </div>

      {/* Left Side - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-20">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-right space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">ברוכים הבאים! 👋</h2>
            <p className="text-muted-foreground">הכנס לחשבון שלך כדי להתחיל לנהל את התקציב</p>
          </div>

          <div className="grid gap-6">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={handleLogin}
            >
              כניסה באמצעות Replit
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  למה להצטרף?
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <FeatureCard icon="📊" title="מעקב חכם" />
               <FeatureCard icon="🎯" title="יעדים" />
               <FeatureCard icon="👨‍👩‍👧‍👦" title="שיתוף משפחתי" />
               <FeatureCard icon="🔒" title="מאובטח" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title }: { icon: string, title: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
      <span className="text-2xl mb-2">{icon}</span>
      <span className="font-medium text-sm">{title}</span>
    </div>
  );
}
