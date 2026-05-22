"use client";

import { useRouter } from "next/navigation";
import { Moon, Sun, Bell, Search, LogOut, User, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  };

  return (
    <header className="h-16 glass-panel border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-white/5 text-muted-foreground">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search notes, quizzes..."
            className="h-9 pl-9 pr-4 w-56 lg:w-72 bg-black/20 border border-white/8 rounded-full text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:bg-white/5 text-muted-foreground">
          <Bell className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-full hover:bg-white/5 text-muted-foreground"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white ml-1 ring-2 ring-transparent hover:ring-indigo-500/30 transition-all">
            AI
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-card border-white/10">
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="hover:bg-white/5 cursor-pointer flex items-center gap-2">
              <User className="w-4 h-4" /> Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
