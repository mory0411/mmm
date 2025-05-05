-- Drop existing tables if they exist
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS relationship_names CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    nickname VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Relationships table
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hash_code VARCHAR UNIQUE NOT NULL,
    child_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    parent_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    answer_text TEXT NOT NULL CHECK (char_length(answer_text) <= 500),
    role TEXT NOT NULL CHECK (role IN ('child', 'parent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (relationship_id, question_id, role)
);

-- 각 사용자의 관계별 이름(별칭) 저장 테이블
CREATE TABLE relationship_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (relationship_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_names ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles: 누구나 읽기/쓰기 가능
CREATE POLICY "Allow public read profiles" ON profiles
    FOR SELECT USING (true);
CREATE POLICY "Allow public create profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- Relationships: 누구나 읽기/쓰기 가능
CREATE POLICY "Allow public read relationships" ON relationships
    FOR SELECT USING (true);
CREATE POLICY "Allow public create relationships" ON relationships
    FOR INSERT WITH CHECK (true);
-- 관계 참여(UPDATE) 허용 정책 추가
CREATE POLICY "Allow user to join relationship as parent or child"
  ON relationships
  FOR UPDATE
  USING (
    -- parent_user_id 또는 child_user_id가 null이거나, 본인인 경우만 허용
    (
      (parent_user_id IS NULL OR parent_user_id = auth.uid())
      OR
      (child_user_id IS NULL OR child_user_id = auth.uid())
    )
  );

-- Questions: 누구나 읽기 가능
CREATE POLICY "Allow public read questions" ON questions
    FOR SELECT USING (true);

-- Answers: 누구나 읽기/쓰기 가능
CREATE POLICY "Allow public read answers" ON answers
    FOR SELECT USING (true);
CREATE POLICY "Allow public create answers" ON answers
    FOR INSERT WITH CHECK (true);

-- 관계별 이름 읽기/쓰기 RLS 정책
CREATE POLICY "Allow public read relationship_names" ON relationship_names
    FOR SELECT USING (true);
CREATE POLICY "Allow public create relationship_names" ON relationship_names
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update relationship_names" ON relationship_names
    FOR UPDATE USING (auth.uid() = user_id);
