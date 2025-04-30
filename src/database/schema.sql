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

-- Create RLS Policies
-- Relationships: 누구나 읽기 가능, 인증된 사용자만 생성 가능
CREATE POLICY "Allow public read relationships" ON relationships
    FOR SELECT USING (true);
CREATE POLICY "Allow authenticated create relationships" ON relationships
    FOR INSERT WITH CHECK (true);

-- Questions: 누구나 읽기 가능, 관리자만 생성/수정 가능
CREATE POLICY "Allow public read questions" ON questions
    FOR SELECT USING (true);

-- Answers: 관련된 relationship의 멤버만 읽기/쓰기 가능
CREATE POLICY "Allow relationship members read answers" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM relationships 
            WHERE relationships.id = answers.relationship_id
        )
    );
CREATE POLICY "Allow relationship members create answers" ON answers
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM relationships 
            WHERE relationships.id = relationship_id
        )
    ); 