# 🧠 SynapseAI — AI Study Platform for Engineering Students

> Upload your syllabus. Get AI-powered notes, quizzes, and a personalized study plan — instantly.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 **PDF Upload & Extract** | Upload your syllabus PDF — AI extracts all topics & key concepts |
| 📝 **AI Notes Generator** | Generate concise, detailed, revision, exam-prep, or viva notes |
| 🧠 **Smart Quiz Generator** | Auto-generate MCQ, short-answer, or viva quizzes with explanations |
| 💬 **AI Tutor Chat** | 24/7 AI tutor that explains concepts deeply with examples & diagrams |
| 📅 **Study Planner** | AI-generated personalized 30-day study timetable |
| 📊 **Analytics Dashboard** | Track study hours, quiz scores, and weak areas |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI**: OpenAI GPT-4o + Google Gemini (with automatic fallback)
- **Styling**: Tailwind CSS + shadcn/ui
- **PDF Parsing**: unpdf
- **Animations**: Framer Motion

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/NalinaHM/SynapseAI.git
cd SynapseAI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your keys:
```bash
cp .env.example .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Set up Supabase
Run the schema in your Supabase SQL editor:
```bash
# Copy contents of supabase/schema.sql and run in Supabase dashboard
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
SynapseAI/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard home
│   │   ├── upload/           # PDF upload & analysis
│   │   ├── notes/            # AI notes generator
│   │   ├── quiz/             # Quiz generator & attempt
│   │   ├── chat/             # AI tutor chat
│   │   ├── study-plan/       # Study planner
│   │   ├── analytics/        # Analytics dashboard
│   │   └── settings/         # User settings
│   └── api/
│       └── chat/             # AI chat streaming API
├── actions/
│   └── upload.ts             # All server actions (upload, notes, quiz, plan)
├── lib/
│   ├── ai/
│   │   ├── models.ts         # AI model config with fallback
│   │   └── prompts.ts        # All AI prompt templates
│   └── supabase/             # Supabase client helpers
├── components/               # Reusable UI components
├── supabase/
│   └── schema.sql            # Full database schema
└── types/                    # TypeScript type definitions
```

---

## 🔑 Environment Variables

See `.env.example` for all required variables. Never commit `.env.local` to Git.

---

## 📄 License

MIT © 2024 SynapseAI
