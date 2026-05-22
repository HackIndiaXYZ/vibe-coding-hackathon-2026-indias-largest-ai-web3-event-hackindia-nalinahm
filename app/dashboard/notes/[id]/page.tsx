import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NoteViewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: note } = await supabase
    .from("notes").select("*").eq("id", id).eq("user_id", user.id).single();

  if (!note) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/notes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Notes
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="capitalize">{note.note_type.replace("_", " ")}</span>
            <span>·</span>
            <span>{note.subject || "General"}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(note.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 p-6 prose-synapse">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </div>
    </div>
  );
}
