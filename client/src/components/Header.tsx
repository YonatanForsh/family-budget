import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md group-hover:scale-110 transition-transform">
              ₪
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              תקציב המשפחה
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/">
            <Button variant={location === "/" ? "secondary" : "ghost"} size="sm" className="hidden sm:flex gap-2">
              <LayoutDashboard className="h-4 w-4" />
              לוח בקרה
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant={location === "/settings" ? "secondary" : "ghost"} size="sm" className="hidden sm:flex gap-2">
              <SettingsIcon className="h-4 w-4" />
              הגדרות
            </Button>
          </Link>

          <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount dir="rtl">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Link href="/">
                <DropdownMenuItem className="cursor-pointer sm:hidden">
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                  <span>לוח בקרה</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer sm:hidden">
                  <SettingsIcon className="ml-2 h-4 w-4" />
                  <span>הגדרות</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="ml-2 h-4 w-4" />
                <span>התנתק</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
