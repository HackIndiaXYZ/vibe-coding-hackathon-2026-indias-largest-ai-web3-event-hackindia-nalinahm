// ─── User ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  study_streak: number;
  total_hours: number;
  quiz_accuracy: number;
}

// ─── Uploads ─────────────────────────────────────────────────────────────────

export interface Upload {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'pdf' | 'image' | 'text';
  storage_path: string;
  extracted_text: string | null;
  subject: string | null;
  created_at: string;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export type NoteType = 'concise' | 'detailed' | 'revision' | 'exam_prep' | 'viva';

export interface Note {
  id: string;
  user_id: string;
  upload_id: string | null;
  title: string;
  content: string;
  note_type: NoteType;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuizType = 'mcq' | 'short_answer' | 'viva' | 'coding';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizType;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  upload_id: string | null;
  title: string;
  subject: string | null;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total: number;
  answers: Record<string, string>;
  completed_at: string;
}

// ─── Study Plan ───────────────────────────────────────────────────────────────

export interface StudySession {
  date: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  type: 'study' | 'revision' | 'quiz' | 'practice';
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  subjects: string[];
  exam_dates: Record<string, string>;
  daily_hours: number;
  sessions: StudySession[];
  created_at: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface Analytics {
  hours_studied: number;
  quizzes_completed: number;
  average_score: number;
  notes_generated: number;
  strong_topics: string[];
  weak_topics: string[];
  study_trend: { date: string; hours: number }[];
}

// ─── AI Output ───────────────────────────────────────────────────────────────

export interface SyllabusExtraction {
  summary: string;
  topics: string[];
  importantConcepts: string[];
  subject: string;
  estimatedHours: number;
}
