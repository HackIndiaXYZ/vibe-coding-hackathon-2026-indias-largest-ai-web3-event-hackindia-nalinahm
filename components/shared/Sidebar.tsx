"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, UploadCloud, MessageSquare, BrainCircuit,
  Calendar, BarChart3, Settings, FileText, ChevronRight, X,
} from "lucide-react";

const nav = [
  { label: "Dashboard",     href: "/dashboard",              icon: LayoutDashboard },
  { label: "Upload",        href: "/dashboard/upload",       icon: UploadCloud },
  { label: "My Notes",      href: "/dashboard/notes",        icon: FileText },
  { label: "Quizzes",       href: "/dashboard/quiz",         icon: BrainCircuit },
  { label: "AI Tutor",      href: "/dashboard/chat",         icon: MessageSquare },
  { label: "Study Planner", href: "/dashboard/study-plan",   icon: Calendar },
  { label: "Analytics",     href: "/dashboard/analytics",    icon: BarChart3 },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 glass-panel border-r border-white/5 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">SynapseAI</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-white/5 text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                active
                  ? "text-white font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />}
              <Icon className={cn("w-4 h-4 relative z-10 shrink-0 transition-transform group-hover:scale-110", active && "text-indigo-400")} />
              <span className="relative z-10 flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 relative z-10 text-indigo-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/5 pt-4 shrink-0">
        <Link href="/dashboard/settings"
          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
            pathname === "/dashboard/settings" ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
          onClick={onClose}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="text-xs font-medium mb-1">Free Plan</div>
          <div className="text-[10px] text-muted-foreground mb-2">3 / 5 uploads used</div>
          <div className="h-1 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          </div>
          <Link href="/pricing" className="mt-2 block text-[10px] text-indigo-400 hover:text-indigo-300 font-medium">Upgrade to Pro →</Link>
        </div>
      </div>
    </aside>
  );
}
