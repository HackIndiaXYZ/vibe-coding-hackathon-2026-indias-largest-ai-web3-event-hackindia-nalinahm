"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, Loader2, CheckCircle2, Sparkles, BookOpen, Lightbulb, Clock } from "lucide-react";
import { uploadAndAnalyzePDF } from "@/actions/upload";
import { toast } from "sonner";
import type { SyllabusExtraction } from "@/types";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ analysis: SyllabusExtraction; uploadId: string } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (files, rejected) => {
      if (rejected.length > 0) { toast.error("File too large or invalid type. Max 10MB PDF."); return; }
      setFile(files[0]);
      setResult(null);
    },
  });

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadAndAnalyzePDF(formData);
    setIsProcessing(false);
    if (!res.success) {
      toast.error(res.error || "Processing failed");
    } else {
      setResult({ analysis: res.data!.analysis, uploadId: res.data!.upload.id });
      toast.success("Syllabus analyzed successfully!");
    }
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Analysis Complete ✨</h1>
            <p className="text-muted-foreground text-sm">Your syllabus has been analyzed and is ready to use.</p>
          </div>
          <button onClick={() => { setFile(null); setResult(null); }} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm transition-colors border border-white/10">
            Upload Another
          </button>
        </div>

        {/* Subject + Summary */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold">{result.analysis.subject}</h2>
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> ~{result.analysis.estimatedHours}h to study
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis.summary}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Topics */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4 text-indigo-400">
              <BookOpen className="w-4 h-4" /> Main Topics ({result.analysis.topics.length})
            </h3>
            <ul className="space-y-2">
              {result.analysis.topics.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Concepts */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4 text-purple-400">
              <Lightbulb className="w-4 h-4" /> Key Concepts
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.analysis.importantConcepts.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Next Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Generate Notes", href: `/dashboard/notes/generate?uploadId=${result.uploadId}`, color: "from-indigo-500 to-blue-600" },
            { label: "Create Quiz",    href: `/dashboard/quiz?uploadId=${result.uploadId}`,  color: "from-purple-500 to-pink-500" },
            { label: "Study Plan",     href: `/dashboard/study-plan`,                        color: "from-teal-500 to-green-500" },
          ].map(({ label, href, color }) => (
            <a key={label} href={href} className={`py-3 rounded-xl bg-gradient-to-r ${color} text-white text-sm font-semibold text-center hover:opacity-90 transition-opacity shadow-lg`}>
              {label}
            </a>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Upload Syllabus</h1>
        <p className="text-muted-foreground text-sm">Upload a PDF and SynapseAI will extract topics, concepts, and generate study materials.</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`glass-card border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all duration-300 group
          ${isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-white/15 hover:border-primary/40 hover:bg-white/3"}`}
      >
        <input {...getInputProps()} />
        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110
          ${isDragActive ? "bg-primary/20" : "bg-white/5"}`}>
          <UploadCloud className={`w-10 h-10 transition-colors ${isDragActive ? "text-primary" : "text-muted-foreground/50"}`} />
        </div>
        <h3 className="font-semibold mb-2">{isDragActive ? "Drop your PDF here..." : "Drag & drop your syllabus PDF"}</h3>
        <p className="text-sm text-muted-foreground mb-5">Supports PDF files up to 10MB</p>
        <span className="px-5 py-2 rounded-full border border-white/15 text-sm hover:bg-white/10 transition-colors inline-block">Browse Files</span>
      </div>

      {/* Selected File */}
      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => setFile(null)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with AI...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analyze Syllabus</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: "📄", title: "PDF Syllabus", desc: "Upload your complete semester syllabus" },
          { icon: "🤖", title: "AI Extraction", desc: "AI identifies topics and key concepts" },
          { icon: "📚", title: "Ready to Study", desc: "Instantly generate notes and quizzes" },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="glass rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs font-semibold mb-1">{title}</div>
            <div className="text-[11px] text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
