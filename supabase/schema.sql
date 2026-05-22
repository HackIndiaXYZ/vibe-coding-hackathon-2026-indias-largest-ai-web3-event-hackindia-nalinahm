-- ============================================================
-- SynapseAI - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  study_streak integer default 0,
  total_hours numeric default 0,
  quiz_accuracy numeric default 0,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Uploads ─────────────────────────────────────────────────────────────────
create table uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  file_name text not null,
  file_type text not null check (file_type in ('pdf', 'image', 'text')),
  storage_path text not null,
  extracted_text text,
  subject text,
  topics text[],
  created_at timestamptz default now()
);
alter table uploads enable row level security;
create policy "Users manage own uploads" on uploads for all using (auth.uid() = user_id);
create index idx_uploads_user_id on uploads(user_id);

-- ─── Notes ───────────────────────────────────────────────────────────────────
create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  upload_id uuid references uploads(id) on delete set null,
  title text not null,
  content text not null,
  note_type text not null default 'concise',
  subject text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table notes enable row level security;
create policy "Users manage own notes" on notes for all using (auth.uid() = user_id);
create index idx_notes_user_id on notes(user_id);

-- ─── Quizzes ─────────────────────────────────────────────────────────────────
create table quizzes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  upload_id uuid references uploads(id) on delete set null,
  title text not null,
  subject text,
  difficulty text not null default 'medium',
  questions jsonb not null default '[]',
  created_at timestamptz default now()
);
alter table quizzes enable row level security;
create policy "Users manage own quizzes" on quizzes for all using (auth.uid() = user_id);
create index idx_quizzes_user_id on quizzes(user_id);

-- ─── Quiz Attempts ────────────────────────────────────────────────────────────
create table quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  score integer not null default 0,
  total integer not null,
  answers jsonb not null default '{}',
  completed_at timestamptz default now()
);
alter table quiz_attempts enable row level security;
create policy "Users manage own attempts" on quiz_attempts for all using (auth.uid() = user_id);

-- ─── Study Plans ──────────────────────────────────────────────────────────────
create table study_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  subjects text[] not null default '{}',
  exam_dates jsonb not null default '{}',
  daily_hours numeric not null default 2,
  sessions jsonb not null default '[]',
  created_at timestamptz default now()
);
alter table study_plans enable row level security;
create policy "Users manage own study plans" on study_plans for all using (auth.uid() = user_id);

-- ─── Chat History ─────────────────────────────────────────────────────────────
create table chat_histories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null default 'New Chat',
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table chat_histories enable row level security;
create policy "Users manage own chats" on chat_histories for all using (auth.uid() = user_id);
create index idx_chats_user_id on chat_histories(user_id);

-- ─── Storage Buckets ─────────────────────────────────────────────────────────
-- Run these in the Supabase dashboard Storage section or via API:
-- 1. Create bucket named: "documents" (private)
-- 2. Add storage policy: authenticated users can insert/select their own files
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

create policy "Authenticated users upload documents"
  on storage.objects for insert
  with check (auth.role() = 'authenticated' and bucket_id = 'documents');

create policy "Users access own documents"
  on storage.objects for select
  using (auth.uid()::text = (storage.foldername(name))[1] and bucket_id = 'documents');
