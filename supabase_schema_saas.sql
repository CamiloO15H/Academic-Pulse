-- Academic Pulse SaaS Schema

-- 1. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() NOT NULL, -- Owner (RLS)
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT DEFAULT 'book',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own subjects" ON subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own subjects" ON subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own subjects" ON subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subjects" ON subjects FOR DELETE USING (auth.uid() = user_id);


-- 2. Academic Content Table (Evolved Tasks)
CREATE TABLE IF NOT EXISTS academic_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() NOT NULL, -- Owner (RLS)
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('transcription', 'web', 'video')),
  content_type TEXT CHECK (content_type IN ('parcial', 'taller', 'tarea', 'apunte')),
  importance_level INT DEFAULT 1 CHECK (importance_level BETWEEN 1 AND 5),
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'archived')),
  description TEXT,
  summary TEXT[],
  key_insights TEXT[],
  study_steps TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Academic Content
ALTER TABLE academic_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own content" ON academic_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own content" ON academic_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own content" ON academic_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content" ON academic_content FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_subject ON academic_content(subject_id);
CREATE INDEX IF NOT EXISTS idx_content_user ON academic_content(user_id);
