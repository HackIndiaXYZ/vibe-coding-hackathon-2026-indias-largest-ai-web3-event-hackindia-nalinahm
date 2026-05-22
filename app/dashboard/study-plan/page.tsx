"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, X, Loader2, ChevronDown, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { generateStudyPlanAction, getUserUploadsAction } from "@/actions/upload";
import { toast } from "sonner";
import type { StudyPlan, StudySession } from "@/types";

const sessionColors: Record<string, string> = {
  study:    "bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
  revision: "bg-purple-500/20 border-purple-500/30 text-purple-300",
  quiz:     "bg-pink-500/20 border-pink-500/30 text-pink-300",
  practice: "bg-teal-500/20 border-teal-500/30 text-teal-300",
};

export default function StudyPlannerPage() {
  const [subjects, setSubjects] = useState<string[]>([""]);
  const [examDates, setExamDates] = useState<Record<string, string>>({});
  const [dailyHours, setDailyHours] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [viewDate, setViewDate] = useState<string | null>(null);
  const [uploads, setUploads] = useState<{ id: string; file_name: string; subject: string }[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  useEffect(() => {
    const fetchUploads = async () => {
      setLoadingUploads(true);
      const res = await getUserUploadsAction();
      setLoadingUploads(false);
      if (res.success && res.data) {
        setUploads(res.data);
      }
    };
    fetchUploads();
  }, []);

  const addUploadedSubject = (subjName: string) => {
    if (!subjName) return;
    
    // Check if subject is already in the list
    if (subjects.some(s => s.trim().toLowerCase() === subjName.trim().toLowerCase())) {
      toast.error(`"${subjName}" is already in your study plan!`);
      return;
    }

    // Replace the first empty subject input, or append to the list
    const emptyIdx = subjects.findIndex(s => !s.trim());
    if (emptyIdx !== -1) {
      setSubjects(s => s.map((x, idx) => idx === emptyIdx ? subjName : x));
    } else {
      setSubjects(s => [...s, subjName]);
    }
    toast.success(`Added "${subjName}" to subjects!`);
  };

  const addSubject = () => setSubjects(s => [...s, ""]);
  const removeSubject = (i: number) => setSubjects(s => s.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, v: string) => setSubjects(s => s.map((x, idx) => idx === i ? v : x));

  const handleGenerate = async () => {
    const validSubjects = subjects.filter(s => s.trim());
    if (!validSubjects.length) { toast.error("Add at least one subject"); return; }
    setIsGenerating(true);
    const res = await generateStudyPlanAction(validSubjects, examDates, dailyHours);
    setIsGenerating(false);
    if (!res.success) { toast.error(res.error!); return; }
    setPlan(res.data);
    setSessions(res.data!.plan.sessions || []);
    toast.success("Study plan generated!");
  };

  const toggleSession = (i: number) => {
    setSessions(s => s.map((sess, idx) => idx === i ? { ...sess, completed: !sess.completed } : sess));
  };

  const grouped = sessions.reduce<Record<string, { session: StudySession; index: number }[]>>((acc, sess, i) => {
    if (!acc[sess.date]) acc[sess.date] = [];
    acc[sess.date].push({ session: sess, index: i });
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  if (plan) return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{plan.title}</h1>
          <p className="text-sm text-muted-foreground">{plan.strategy}</p>
        </div>
        <button onClick={() => setPlan(null)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 border border-white/10 transition-all whitespace-nowrap">
          Regenerate
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sessions", val: sessions.length },
          { label: "Completed",      val: sessions.filter(s => s.completed).length },
          { label: "Days Planned",   val: dates.length },
        ].map(({ label, val }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold mb-0.5">{val}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {dates.slice(0, 14).map(date => (
          <div key={date} className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <button onClick={() => setViewDate(viewDate === date ? null : date)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold">{new Date(date).getDate()}</div>
                <div className="text-left">
                  <div className="text-sm font-medium">{new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
                  <div className="text-xs text-muted-foreground">{grouped[date].length} sessions</div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${viewDate === date ? "rotate-180" : ""}`} />
            </button>
            {viewDate === date && (
              <div className="px-5 pb-4 space-y-2 border-t border-white/5 pt-3">
                {grouped[date].map(({ session: sess, index }) => (
                  <div key={index} onClick={() => toggleSession(index)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${sessionColors[sess.type]} ${sess.completed ? "opacity-50" : ""}`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${sess.completed ? "text-emerald-400" : "opacity-30"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${sess.completed ? "line-through" : ""}`}>{sess.topic}</div>
                      <div className="text-xs opacity-70">{sess.subject} · {sess.type}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs opacity-70 shrink-0">
                      <Clock className="w-3 h-3" /> {sess.duration}m
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Study Planner</h1>
        <p className="text-muted-foreground text-sm">Tell SynapseAI your subjects and exam dates — it'll build your perfect schedule.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 block">Your Subjects</label>
          <div className="space-y-2">
            {subjects.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input value={s} onChange={e => updateSubject(i, e.target.value)} placeholder={`Subject ${i + 1}...`}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40 transition-all" />
                {subjects.length > 1 && (
                  <button onClick={() => removeSubject(i)} className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-white/10 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addSubject} className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-opacity">
            <Plus className="w-3.5 h-3.5" /> Add Subject
          </button>

          {/* Quick Add from Uploaded Syllabi */}
          {uploads.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                Quick Add from your uploads:
              </span>
              <div className="flex flex-wrap gap-2">
                {uploads.map(up => {
                  const subjectName = up.subject || up.file_name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                  return (
                    <button
                      key={up.id}
                      type="button"
                      onClick={() => addUploadedSubject(subjectName)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium hover:bg-indigo-500/25 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" /> {subjectName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Exam Dates <span className="text-muted-foreground font-normal">(optional)</span></label>
          <div className="space-y-2">
            {subjects.filter(s => s.trim()).map(subj => (
              <div key={subj} className="flex items-center gap-3">
                <span className="text-xs font-medium w-28 shrink-0 truncate text-muted-foreground">{subj}</span>
                <input type="date" value={examDates[subj] || ""} onChange={e => setExamDates(prev => ({ ...prev, [subj]: e.target.value }))}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/40 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Daily Study Hours: <span className="text-primary font-bold">{dailyHours}h</span></label>
          <input type="range" min={1} max={10} value={dailyHours} onChange={e => setDailyHours(+e.target.value)} className="w-full accent-indigo-500" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1h</span><span>10h</span></div>
        </div>

        <button onClick={handleGenerate} disabled={isGenerating}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Building your plan...</> : <><Calendar className="w-4 h-4" /> Generate Study Plan</>}
        </button>
      </div>
    </div>
  );
}
