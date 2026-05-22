"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, BrainCircuit, Code2, BookOpen, Lightbulb, Trash2, Plus, Loader2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import { getUserUploadsAction } from "@/actions/upload";

const starters = [
  { icon: BookOpen, text: "Explain the concept of recursion with examples" },
  { icon: Code2, text: "How does dynamic programming differ from greedy algorithms?" },
  { icon: Lightbulb, text: "What are the SOLID principles in software engineering?" },
  { icon: BrainCircuit, text: "Explain Big-O notation in simple terms" },
];

export default function ChatPage() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [uploads, setUploads] = useState<{ id: string; file_name: string; subject: string }[]>([]);
  const [selectedUploadId, setSelectedUploadId] = useState("");
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

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      body: () => ({
        uploadId: selectedUploadId,
      }),
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendStarter = (text: string) => {
    if (isLoading) return;
    sendMessage({ text });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const getMessageContent = (msg: any): string => {
    if (msg.content) return msg.content;
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg.parts
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join("");
    }
    return "";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">AI Tutor</h1>
          <p className="text-muted-foreground text-sm">Powered by GPT-4o · Explains any engineering concept</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Course Context Selector */}
      <div className="mb-4 glass-card rounded-xl p-3 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-muted-foreground">Select Course Context:</span>
        </div>
        {loadingUploads ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your uploads...
          </div>
        ) : uploads.length > 0 ? (
          <select
            value={selectedUploadId}
            onChange={e => setSelectedUploadId(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/40 cursor-pointer max-w-xs truncate"
          >
            <option value="" className="bg-neutral-900 text-muted-foreground">General AI Tutor (No syllabus context)</option>
            {uploads.map(up => (
              <option key={up.id} value={up.id} className="bg-neutral-900 text-foreground">
                📚 {up.subject || up.file_name} ({up.file_name})
              </option>
            ))}
          </select>
        ) : (
          <div className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
            No uploads found. Upload a syllabus in the Upload page to chat with it!
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/5 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">SynapseAI Tutor</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-sm">Ask me anything about your coursework. I can explain concepts, solve problems, and help you prepare for exams.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {starters.map(({ icon: Icon, text }) => (
                  <button key={text} onClick={() => sendStarter(text)}
                    className="flex items-start gap-3 p-3 rounded-xl glass border border-white/8 text-left hover:border-primary/30 hover:bg-primary/5 transition-all group text-sm">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  : "bg-gradient-to-br from-teal-500 to-cyan-600 text-white"
                }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                  ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-tr-none"
                  : "glass border border-white/8 rounded-tl-none prose-synapse"
                }`}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown>{getMessageContent(msg)}</ReactMarkdown>
                ) : (
                  <span>{getMessageContent(msg)}</span>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass border border-white/8 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                {[0, 0.2, 0.4].map(delay => (
                  <div key={delay} className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <form id="chat-form" onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about your engineering coursework..."
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
            />
            <button type="submit" disabled={!input?.trim() || isLoading}
              className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-opacity shrink-0 shadow-lg shadow-primary/20">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/40">
            <Sparkles className="w-3 h-3" /> SynapseAI may make mistakes. Verify important information.
          </div>
        </div>
      </div>
    </div>
  );
}
