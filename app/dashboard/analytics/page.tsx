import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, Target, TrendingUp, BookOpen, BrainCircuit, Zap } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: notes, count: notesCount },
    { data: quizzes },
    { data: attempts },
    { data: uploads, count: uploadsCount },
  ] = await Promise.all([
    supabase.from("notes").select("*", { count: "exact" }).eq("user_id", user.id),
    supabase.from("quizzes").select("*").eq("user_id", user.id),
    supabase.from("quiz_attempts").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(20),
    supabase.from("uploads").select("*", { count: "exact" }).eq("user_id", user.id),
  ]);

  const avgScore = attempts?.length
    ? Math.round(attempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / attempts.length)
    : 0;

  const stats = [
    { icon: BarChart3, label: "Quiz Avg Score",     value: `${avgScore}%`,          color: "from-green-500 to-emerald-500",  sub: `${attempts?.length ?? 0} quizzes taken` },
    { icon: BookOpen,  label: "Notes Generated",    value: `${notesCount ?? 0}`,    color: "from-indigo-500 to-blue-500",    sub: "AI-generated notes" },
    { icon: BrainCircuit, label: "Quizzes Created", value: `${quizzes?.length ?? 0}`, color: "from-purple-500 to-pink-500", sub: "custom quizzes" },
    { icon: Zap,       label: "Files Processed",    value: `${uploadsCount ?? 0}`,  color: "from-amber-500 to-orange-500",   sub: "syllabi uploaded" },
  ];

  // Build score trend from attempts
  const scoreTrend = (attempts ?? []).slice(0, 10).reverse().map((a, i) => ({
    label: `Q${i + 1}`,
    score: Math.round((a.score / a.total) * 100),
  }));

  // Subject breakdown from notes
  const subjectMap: Record<string, number> = {};
  (notes ?? []).forEach(n => {
    const subj = n.subject || "General";
    subjectMap[subj] = (subjectMap[subj] || 0) + 1;
  });
  const subjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSubjectCount = Math.max(...subjects.map(([, v]) => v), 1);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your study progress and identify areas for improvement.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, sub }) => (
          <div key={label} className="glass-card rounded-2xl p-5 group hover:scale-[1.02] transition-transform duration-300">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold mb-0.5">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        <div className="glass-panel rounded-2xl border border-white/5 p-5">
          <h3 className="font-semibold text-sm mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Quiz Score Trend
          </h3>
          {scoreTrend.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground/50">Take quizzes to see your progress</div>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {scoreTrend.map(({ label, score }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[9px] text-muted-foreground font-medium">{score}%</div>
                  <div className="w-full rounded-t-md transition-all duration-500"
                    style={{ height: `${(score / 100) * 96}px`, background: score >= 70 ? "linear-gradient(to top, #10b981, #34d399)" : score >= 50 ? "linear-gradient(to top, #6366f1, #818cf8)" : "linear-gradient(to top, #f97316, #fb923c)" }} />
                  <div className="text-[9px] text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subject Breakdown */}
        <div className="glass-panel rounded-2xl border border-white/5 p-5">
          <h3 className="font-semibold text-sm mb-5 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" /> Notes by Subject
          </h3>
          {subjects.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground/50">Generate notes to see subject breakdown</div>
          ) : (
            <div className="space-y-3">
              {subjects.map(([subject, count]) => (
                <div key={subject}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium truncate">{subject}</span>
                    <span className="text-muted-foreground shrink-0">{count} notes</span>
                  </div>
                  <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxSubjectCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Attempts */}
      {(attempts?.length ?? 0) > 0 && (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-sm">Recent Quiz Attempts</h3>
          </div>
          <div className="divide-y divide-white/5">
            {attempts!.slice(0, 8).map(attempt => {
              const pct = Math.round((attempt.score / attempt.total) * 100);
              return (
                <div key={attempt.id} className="flex items-center gap-4 px-5 py-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${pct >= 70 ? "bg-emerald-500/20 text-emerald-400" : pct >= 50 ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Quiz Attempt</div>
                    <div className="text-xs text-muted-foreground">{attempt.score}/{attempt.total} correct · {new Date(attempt.completed_at).toLocaleDateString()}</div>
                  </div>
                  <div className="w-20 h-1.5 bg-black/30 rounded-full overflow-hidden shrink-0">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 70 ? "#10b981" : pct >= 50 ? "#6366f1" : "#ef4444" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
