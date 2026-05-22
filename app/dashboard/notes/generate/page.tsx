"use client";

import { useState, useEffect, Suspense } from "react";
import { generateNotesAction, getUserUploadsAction } from "@/actions/upload";
import { toast } from "sonner";
import { Loader2, Copy, Download, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { NoteType } from "@/types";
import { useSearchParams } from "next/navigation";

const noteTypes: { value: NoteType; label: string; desc: string }[] = [
  { value: "concise", label: "Concise", desc: "Short bullet-point notes" },
  { value: "detailed", label: "Detailed", desc: "In-depth with examples" },
  { value: "revision", label: "Revision", desc: "Quick-recall summaries" },
  { value: "exam_prep", label: "Exam Prep", desc: "Most likely exam content" },
  { value: "viva", label: "Viva Q&A", desc: "Oral exam preparation" },
];

function NotesGenerateForm() {
  const searchParams = useSearchParams();
  const [uploadId, setUploadId] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("concise");
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [uploads, setUploads] = useState<{ id: string; file_name: string; subject: string }[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  useEffect(() => {
    const fetchUploads = async () => {
      setLoadingUploads(true);
      const res = await getUserUploadsAction();
      setLoadingUploads(false);
      if (res.success && res.data) {
        setUploads(res.data);
        
        const searchId = searchParams.get("uploadId");
        if (searchId) {
          setUploadId(searchId);
        } else if (res.data.length > 0) {
          setUploadId(res.data[0].id);
        }
      }
    };
    fetchUploads();
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!uploadId.trim()) { toast.error("Enter an Upload ID"); return; }
    setIsGenerating(true);
    const res = await generateNotesAction(uploadId, noteType);
    setIsGenerating(false);
    if (!res.success) { toast.error(res.error!); return; }
    setContent(res.data!.content);
    toast.success("Notes generated!");
  };

  const copyContent = () => {
    if (content) { navigator.clipboard.writeText(content); toast.success("Copied to clipboard"); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Generate Notes</h1>
        <p className="text-muted-foreground text-sm">Choose a style and let AI generate study notes from your upload.</p>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center justify-between">
            <span>Select Material / Syllabus</span>
            <span className="text-xs text-muted-foreground font-normal">Or paste Upload ID below</span>
          </label>
          {loadingUploads ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your uploads...
            </div>
          ) : uploads.length > 0 ? (
            <select
              value={uploadId}
              onChange={e => setUploadId(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-all mb-3 cursor-pointer"
            >
              <option value="" className="bg-neutral-900 text-muted-foreground">-- Choose from your previous uploads --</option>
              {uploads.map(up => (
                <option key={up.id} value={up.id} className="bg-neutral-900 text-foreground">
                  {up.subject || up.file_name} ({up.file_name})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-amber-400 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 mb-3">
              No previous uploads found. You can upload one in the Upload page or paste an ID below.
            </div>
          )}
          <input value={uploadId} onChange={e => setUploadId(e.target.value)} placeholder="Or paste custom upload ID here..."
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40 transition-all" />
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Note Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {noteTypes.map(nt => (
              <button key={nt.value} onClick={() => setNoteType(nt.value)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-center ${noteType === nt.value ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"}`}>
                <div className="font-semibold">{nt.label}</div>
                <div className="opacity-70 mt-0.5 text-[10px] hidden sm:block">{nt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={isGenerating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2">
          {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : "Generate Notes"}
        </button>
      </div>

      {content && (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <span className="text-sm font-medium capitalize">{noteType.replace("_", " ")} Notes</span>
            <div className="flex gap-2">
              <button onClick={copyContent} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button onClick={handleGenerate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>
          </div>
          <div className="p-6 prose-synapse max-w-none overflow-y-auto max-h-[60vh]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NoteDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary animate-pulse" />
      </div>
    }>
      <NotesGenerateForm />
    </Suspense>
  );
}
