"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Loader2, CheckCircle2, XCircle, ChevronRight, Trophy } from "lucide-react";
import { generateQuizAction, saveQuizAttempt, getUserUploadsAction } from "@/actions/upload";
import { toast } from "sonner";
import type { Difficulty, QuizType, Quiz, QuizQuestion } from "@/types";
import { useSearchParams } from "next/navigation";

type Screen = "setup" | "loading" | "quiz" | "results";

function QuizForm() {
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>("setup");
  const [uploadId, setUploadId] = useState("");
  const [quizType, setQuizType] = useState<QuizType>("mcq");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(10);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
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
    if (!uploadId.trim()) { toast.error("Please enter an Upload ID"); return; }
    setScreen("loading");
    const res = await generateQuizAction(uploadId, quizType, difficulty, count);
    if (!res.success) { toast.error(res.error!); setScreen("setup"); return; }
    setQuiz(res.data as Quiz);
    setCurrent(0);
    setAnswers({});
    setScreen("quiz");
  };

  const handleAnswer = (qId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (current + 1 >= (quiz?.questions.length ?? 0)) {
      const score = quiz!.questions.filter(q => answers[q.id] === q.correct_answer).length;
      saveQuizAttempt(quiz!.id, answers, score, quiz!.questions.length);
      setScreen("results");
    } else {
      setCurrent(c => c + 1);
    }
  };

  const score = quiz ? quiz.questions.filter(q => answers[q.id] === q.correct_answer).length : 0;
  const pct = quiz ? Math.round((score / quiz.questions.length) * 100) : 0;
  const q: QuizQuestion | undefined = quiz?.questions[current];

  if (screen === "loading") return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
        <BrainCircuit className="w-8 h-8 text-white" />
      </div>
      <div className="text-center">
        <div className="font-semibold mb-1">Generating Quiz...</div>
        <div className="text-sm text-muted-foreground">AI is crafting your personalized questions</div>
      </div>
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    </div>
  );

  if (screen === "results") return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center space-y-6">
      <div className="glass-card rounded-3xl p-10 border border-white/10">
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${pct >= 70 ? "text-amber-400" : pct >= 50 ? "text-blue-400" : "text-muted-foreground"}`} />
        <h1 className="text-3xl font-black mb-2">{pct >= 80 ? "Excellent! 🎉" : pct >= 60 ? "Good Job! 👍" : "Keep Practicing 💪"}</h1>
        <div className="text-6xl font-black gradient-text my-4">{pct}%</div>
        <p className="text-muted-foreground">{score} out of {quiz!.questions.length} correct</p>
        <div className="h-2 bg-black/30 rounded-full overflow-hidden mt-6">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${pct >= 70 ? "bg-gradient-to-r from-green-500 to-emerald-400" : pct >= 50 ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-gradient-to-r from-orange-500 to-red-400"}`} />
        </div>
      </div>
      <div className="space-y-2">
        {quiz!.questions.map((q, i) => (
          <div key={q.id} className={`glass-card rounded-xl p-4 flex items-start gap-3 text-left border ${answers[q.id] === q.correct_answer ? "border-emerald-500/20" : "border-red-500/20"}`}>
            {answers[q.id] === q.correct_answer ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
            <div>
              <div className="text-sm font-medium mb-1">Q{i + 1}: {q.question}</div>
              <div className="text-xs text-muted-foreground">{q.explanation}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setScreen("setup")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity">
        Generate New Quiz
      </button>
    </motion.div>
  );

  if (screen === "quiz" && q) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Question {current + 1} of {quiz!.questions.length}</span>
        <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 capitalize">{quiz!.difficulty}</span>
      </div>
      <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          animate={{ width: `${((current + 1) / quiz!.questions.length) * 100}%` }} />
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h2 className="text-base font-semibold mb-6 leading-relaxed">{q.question}</h2>
        {q.type === "mcq" && q.options ? (
          <div className="space-y-2">
            {q.options.map((opt) => {
              const answered = !!answers[q.id];
              const isCorrect = opt === q.correct_answer;
              const isSelected = answers[q.id] === opt;
              return (
                <button key={opt} onClick={() => !answered && handleAnswer(q.id, opt)} disabled={answered}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${answered
                      ? isCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : isSelected ? "border-red-500 bg-red-500/10 text-red-300"
                          : "border-white/5 opacity-50"
                      : "border-white/10 hover:border-primary/40 hover:bg-primary/5"
                    }`}>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea rows={3} placeholder="Type your answer..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40 resize-none"
              onChange={e => !answers[q.id] && setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
            <button onClick={() => { setShowExplanation(true); }}
              className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors">
              Check Answer
            </button>
          </div>
        )}

        <AnimatePresence>
          {showExplanation && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-200">
              <span className="font-semibold">💡 Explanation:</span> {q.explanation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showExplanation && (
        <button onClick={handleNext} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          {current + 1 >= quiz!.questions.length ? "View Results" : "Next Question"}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  // Setup screen
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Quiz Generator</h1>
        <p className="text-muted-foreground text-sm">Generate AI-powered quizzes from your uploaded materials.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
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
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all" />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Question Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["mcq", "short_answer", "viva", "coding"] as QuizType[]).map(t => (
              <button key={t} onClick={() => setQuizType(t)}
                className={`py-2.5 rounded-xl border text-xs font-medium transition-all capitalize ${quizType === t ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(129,140,248,0.2)]" : "border-white/10 text-muted-foreground hover:border-white/20"}`}>
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`py-2.5 rounded-xl border text-xs font-medium transition-all capitalize ${difficulty === d ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Number of Questions: <span className="text-primary">{count}</span></label>
          <input type="range" min={5} max={20} value={count} onChange={e => setCount(+e.target.value)}
            className="w-full accent-indigo-500" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>5</span><span>20</span></div>
        </div>

        <button onClick={handleGenerate}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
          <BrainCircuit className="w-4 h-4" /> Generate Quiz with AI
        </button>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary animate-pulse" />
      </div>
    }>
      <QuizForm />
    </Suspense>
  );
}
