import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowRight, Plus } from "lucide-react";

const noteTypeColors: Record<string, string> = {
  concise:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  detailed: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  revision: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  exam_prep:"bg-pink-500/15 text-pink-400 border-pink-500/20",
  viva:     "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Notes</h1>
          <p className="text-muted-foreground text-sm">All your AI-generated study notes in one place.</p>
        </div>
        <Link href="/dashboard/notes/generate"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Generate Notes
        </Link>
      </div>

      {!notes?.length ? (
        <div className="glass-card rounded-2xl border border-white/10 py-20 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-semibold mb-2">No notes yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Generate notes from your previous uploads or add a new syllabus PDF.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
            <Link href="/dashboard/notes/generate" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20">
              Select Previous Upload
            </Link>
            <Link href="/dashboard/upload" className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Upload New Syllabus
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(note => (
            <Link key={note.id} href={`/dashboard/notes/${note.id}`}
              className="glass-card rounded-2xl p-5 border border-white/10 group hover:border-primary/20 hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${noteTypeColors[note.note_type] || noteTypeColors.concise}`}>
                  {note.note_type.replace("_", " ")}
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-1 leading-snug group-hover:text-primary transition-colors line-clamp-2">{note.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                {note.content.substring(0, 120).replace(/[#*`]/g, "")}...
              </p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{note.subject || "General"}</span>
                <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                  Read <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
