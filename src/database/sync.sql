-- Drop existing tables if they exist
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS share_links CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;

-- Create Relationships table
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hash_code VARCHAR UNIQUE NOT NULL,
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
    answer_text TEXT NOT NULL CHECK (char_length(answer_text) <= 500),
    role TEXT NOT NULL CHECK (role IN ('child', 'parent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_answers_relationship_id ON answers(relationship_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_relationships_hash_code ON relationships(hash_code);

-- Enable RLS
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow relationship members read answers" ON answers;
DROP POLICY IF EXISTS "Allow relationship members create answers" ON answers;
DROP POLICY IF EXISTS "Allow public read answers" ON answers;
DROP POLICY IF EXISTS "Allow public create answers" ON answers;
DROP POLICY IF EXISTS "Allow public read relationships" ON relationships;
DROP POLICY IF EXISTS "Allow authenticated create relationships" ON relationships;
DROP POLICY IF EXISTS "Allow public create relationships" ON relationships;
DROP POLICY IF EXISTS "Allow public read questions" ON questions;

-- Create RLS Policies
-- Relationships: 누구나 읽기/쓰기 가능
CREATE POLICY "Allow public read relationships" ON relationships
    FOR SELECT USING (true);
CREATE POLICY "Allow public create relationships" ON relationships
    FOR INSERT WITH CHECK (true);

-- Questions: 누구나 읽기 가능
CREATE POLICY "Allow public read questions" ON questions
    FOR SELECT USING (true);

-- Answers: 누구나 읽기/쓰기 가능
CREATE POLICY "Allow public read answers" ON answers
    FOR SELECT USING (true);
CREATE POLICY "Allow public create answers" ON answers
    FOR INSERT WITH CHECK (true);

-- Insert dummy questions
INSERT INTO questions (text) VALUES
    ('오늘 하루 중 가장 기억에 남는 순간은 무엇인가요?'),
    ('어린 시절 가장 재미있었던 놀이는 무엇인가요?'),
    ('우리 가족만의 특별한 전통이나 규칙이 있나요?'),
    ('지금까지 가장 행복했던 가족 여행은 언제인가요?'),
    ('부모님/자녀에게 가장 감사한 점은 무엇인가요?'),
    ('우리 가족의 장점은 무엇이라고 생각하나요?'),
    ('가족과 함께 하고 싶은 버킷리스트가 있나요?'),
    ('우리 가족의 첫 만남을 기억하시나요?'),
    ('가족에게 전하지 못한 마음이 있다면 무엇인가요?'),
    ('우리 가족의 미래 모습을 상상해본다면 어떨까요?'); 