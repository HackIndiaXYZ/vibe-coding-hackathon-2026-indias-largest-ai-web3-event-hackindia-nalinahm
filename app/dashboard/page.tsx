import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UploadCloud, BrainCircuit, MessageSquare, Calendar, FileText, ArrowRight, Flame, BarChart3, Clock, Zap } from "lucide-react";

// ── Skeleton ─────────────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 skeleton h-28" />
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <div className={`glass-card rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xs text-emerald-400 font-medium mt-1">{sub}</div>
    </div>
  );
}

// ── Quick Action ──────────────────────────────────────────────────────────────

function QuickAction({ href, icon: Icon, label, desc, color }: { href: string; icon: any; label: string; desc: string; color: string }) {
  return (
    <Link href={href} className="glass-card rounded-2xl p-5 flex items-start gap-4 group hover:scale-[1.01] transition-all duration-300 border border-transparent hover:border-white/10">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-0.5">{label}</div>
        <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-0.5" />
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: uploads }, { data: notes }, { data: quizzes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("uploads").select("id, file_name, subject, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("notes").select("id, title, note_type, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("quizzes").select("id, title, difficulty, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
  ]);

  const name = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
          {greeting}, {name} 👋
        </h1>
        <p className="text-muted-foreground text-sm">Here's an overview of your study progress today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame}    label="Study Streak"   value={`${profile?.study_streak ?? 0} days`}    sub="Keep it going!"          color="from-orange-500 to-red-500" />
        <StatCard icon={BarChart3} label="Quiz Accuracy"  value={`${profile?.quiz_accuracy ?? 0}%`}       sub="Above average"           color="from-green-500 to-emerald-500" />
        <StatCard icon={Clock}    label="Hours Studied"  value={`${profile?.total_hours ?? 0}h`}          sub="This week"               color="from-blue-500 to-cyan-500" />
        <StatCard icon={Zap}      label="AI Interactions" value={`${(notes?.length ?? 0) + (quizzes?.length ?? 0)}`} sub="Notes + Quizzes generated" color="from-indigo-500 to-purple-500" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction href="/dashboard/upload"     icon={UploadCloud}  label="Upload Syllabus"       desc="Upload a PDF and extract topics instantly"     color="from-indigo-500 to-blue-600" />
          <QuickAction href="/dashboard/quiz"       icon={BrainCircuit} label="Generate Quiz"         desc="Test your knowledge with AI-powered quizzes"   color="from-purple-500 to-pink-500" />
          <QuickAction href="/dashboard/chat"       icon={MessageSquare}label="Ask AI Tutor"          desc="Get instant explanations for any concept"       color="from-teal-500 to-cyan-500" />
          <QuickAction href="/dashboard/notes"      icon={FileText}     label="View My Notes"         desc="Browse and review all your generated notes"     color="from-amber-500 to-orange-500" />
          <QuickAction href="/dashboard/study-plan" icon={Calendar}     label="Create Study Plan"     desc="AI-generated personalized timetable"           color="from-rose-500 to-pink-500" />
          <QuickAction href="/dashboard/analytics"  icon={BarChart3}    label="View Analytics"        desc="Track progress and identify weak areas"         color="from-green-500 to-teal-500" />
        </div>
      </div>

      {/* Recent Uploads + Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-sm">Recent Uploads</h3>
            <Link href="/dashboard/upload" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-white/5">
            {!uploads?.length ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                <UploadCloud className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No uploads yet. Start by uploading a syllabus!
              </div>
            ) : uploads.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.file_name}</div>
                  <div className="text-xs text-muted-foreground">{u.subject || "No subject"} · {new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-sm">Recent Notes</h3>
            <Link href="/dashboard/notes" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-white/5">
            {!notes?.length ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notes yet. Upload a syllabus to generate notes!
              </div>
            ) : notes.map(n => (
              <Link key={n.id} href={`/dashboard/notes/${n.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{n.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{n.note_type.replace('_', ' ')} · {new Date(n.created_at).toLocaleDateString()}</div>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
