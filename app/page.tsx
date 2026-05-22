"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  BrainCircuit, Sparkles, Zap, ArrowRight, BookOpen, Upload,
  MessageSquare, Calendar, BarChart3, Shield, ChevronDown,
  CheckCircle2, Star, Code2, Share2, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

// ── Data ────────────────────────────────────────────────────────────────────
const features = [
  { icon: Upload,       label: "Upload & Extract",  desc: "Upload PDFs, images, or notes. AI instantly extracts topics and concepts.",       color: "from-indigo-500 to-blue-500" },
  { icon: BookOpen,     label: "AI Notes",           desc: "Generate concise, detailed, or revision notes tailored to your learning style.", color: "from-purple-500 to-indigo-500" },
  { icon: BrainCircuit, label: "Smart Quizzes",      desc: "Auto-generate MCQs, coding challenges, and viva questions with instant feedback.", color: "from-pink-500 to-purple-500" },
  { icon: MessageSquare,label: "AI Tutor",           desc: "24/7 AI tutor that explains concepts, solves doubts, and guides exam prep.",     color: "from-orange-500 to-pink-500" },
  { icon: Calendar,     label: "Study Planner",      desc: "AI-generated personalized timetables that adapt to your exam schedule.",         color: "from-green-500 to-teal-500" },
  { icon: BarChart3,    label: "Analytics",          desc: "Track study hours, quiz performance, and identify strong & weak areas.",        color: "from-cyan-500 to-green-500" },
];

const testimonials = [
  { name: "Arjun Patel",   role: "CSE Final Year", text: "SynapseAI cut my study time in half. The AI quizzes are incredibly accurate for gate prep!", avatar: "AP" },
  { name: "Priya Sharma",  role: "ECE Student",    text: "I uploaded my entire semester syllabus and got a complete study plan in 30 seconds. Mind-blowing.", avatar: "PS" },
  { name: "Rahul Verma",   role: "Mechanical Engg",text: "The AI tutor explains thermodynamics better than most professors. It's my go-to study tool now.", avatar: "RV" },
];

const pricing = [
  { plan: "Free",   price: "₹0",   period: "/month", features: ["5 PDF uploads/month", "Basic AI notes", "10 quizzes/month", "Community support"], cta: "Get Started", primary: false },
  { plan: "Pro",    price: "₹299", period: "/month", features: ["Unlimited uploads", "All note styles", "Unlimited quizzes", "AI Tutor access", "Study planner", "Priority support"], cta: "Start Free Trial", primary: true },
  { plan: "Team",   price: "₹799", period: "/month", features: ["Everything in Pro", "5 team members", "Shared workspaces", "Analytics dashboard", "API access"], cta: "Contact Us", primary: false },
];

const faqs = [
  { q: "What file formats does SynapseAI support?", a: "We support PDF, PNG, JPG, and plain text files. Our AI can extract text from scanned PDFs and handwritten notes via OCR." },
  { q: "How accurate is the AI-generated content?", a: "Our AI is powered by GPT-4o and is optimized with engineering-specific prompts. All generated content is based directly on your uploaded materials." },
  { q: "Can I export my notes and quizzes?", a: "Yes! You can export notes as PDF or Markdown, and quizzes as PDF or CSV for offline use." },
  { q: "Is my data secure?", a: "All files are stored in Supabase with row-level security. Your data is never used to train AI models." },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div className="bg-mesh min-h-screen text-foreground overflow-x-hidden">
      {/* Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/12 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SynapseAI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "FAQ"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full shadow-lg shadow-primary/25 bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:opacity-90">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden glass border-t border-white/5 px-6 py-4 space-y-3">
            {["Features", "Pricing", "FAQ"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground py-2">
                {item}
              </a>
            ))}
            <Button asChild className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 border-0">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-6 min-h-screen flex items-center z-10">
        <div className="max-w-5xl mx-auto text-center w-full">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-indigo-500/30 text-xs font-medium text-indigo-300 mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by GPT-4o · Built for Engineering Students
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
              Study Smarter.<br />
              <span className="gradient-text">Learn Faster.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your syllabus, and SynapseAI instantly generates personalized notes, quizzes, and study plans—powered by AI that understands engineering.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-13 px-8 rounded-full text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-xl shadow-primary/25 hover:opacity-90 transition-opacity">
                <Link href="/signup">
                  Start for Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-13 px-8 rounded-full text-base border-white/10 hover:bg-white/5 glass">
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-xs text-muted-foreground/60">
              No credit card required · 5 free uploads per month · Used by 500+ engineering students
            </motion.p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ y: heroY }}
            className="mt-20 relative"
          >
            <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50 glow-sm">
              <div className="h-8 flex items-center px-4 gap-2 border-b border-white/5 bg-black/20">
                {["#ef4444", "#f59e0b", "#10b981"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                <div className="flex-1 mx-4 h-4 bg-white/5 rounded-full text-xs flex items-center justify-center text-muted-foreground/40 text-[10px]">synapse-ai.vercel.app/dashboard</div>
              </div>
              <div className="h-64 md:h-96 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 px-8 w-full max-w-lg">
                  {[
                    { label: "Study Streak", val: "12 days 🔥", color: "text-orange-400" },
                    { label: "Quiz Score",   val: "87% avg",    color: "text-green-400" },
                    { label: "Hours Today",  val: "3.5h ⏱",    color: "text-blue-400" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="glass rounded-2xl p-4 text-center">
                      <div className={`text-xl font-bold ${color}`}>{val}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-3xl pointer-events-none" />
          </motion.div>

          <motion.a
            href="#features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="inline-flex flex-col items-center gap-2 mt-16 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.a>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to <span className="gradient-text">ace your exams</span></motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">Six powerful AI features that work together seamlessly to make you a smarter student.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, label, desc, color }) => (
              <motion.div key={label} variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-6 group cursor-pointer relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">Loved by students <span className="gradient-text">across India</span></motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, avatar }) => (
              <motion.div key={name} variants={fadeUp} className="glass-card rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">{avatar}</div>
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Pricing</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, <span className="gradient-text">student-friendly</span> pricing</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map(({ plan, price, period, features, cta, primary }) => (
              <motion.div key={plan} variants={fadeUp}
                className={`rounded-2xl p-6 relative overflow-hidden ${primary ? "bg-gradient-to-b from-indigo-600/20 to-purple-600/10 border-2 border-indigo-500/50 glow-sm" : "glass-card"}`}>
                {primary && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-bold text-white">MOST POPULAR</div>}
                <div className="mb-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">{plan}</div>
                  <div className="text-4xl font-black">{price}<span className="text-sm font-normal text-muted-foreground">{period}</span></div>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className={`w-full rounded-xl ${primary ? "bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:opacity-90 shadow-lg shadow-primary/25" : "variant-outline bg-white/5 hover:bg-white/10"}`}>
                  <Link href="/signup">{cta}</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 py-24 px-6 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight">Frequently asked <span className="gradient-text">questions</span></motion.h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex justify-between items-center px-6 py-4">
                  <span className="font-medium text-sm">{q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </div>
                {openFaq === i && <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-4">{a}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              Ready to transform<br /> your <span className="gradient-text">study game?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-10">Join thousands of engineering students already using SynapseAI.</motion.p>
            <motion.div variants={fadeUp}>
              <Button asChild size="lg" className="h-14 px-10 rounded-full text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-2xl shadow-primary/30 hover:opacity-90 transition-opacity">
                <Link href="/signup">Get Started – It's Free <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">SynapseAI</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SynapseAI. Built with ❤️ for engineering students.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Share2 className="w-4 h-4" /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Code2 className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
