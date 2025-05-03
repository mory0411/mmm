-- Drop existing tables if they exist
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (child_user_id != parent_user_id),
    CHECK (
        (child_user_id IS NOT NULL AND parent_user_id IS NULL) OR
        (child_user_id IS NULL AND parent_user_id IS NOT NULL) OR
        (child_user_id IS NOT NULL AND parent_user_id IS NOT NULL)
    )
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
    UNIQUE (relationship_id, question_id, role),
    CHECK (
        (role = 'child' AND user_id = (SELECT child_user_id FROM relationships WHERE id = relationship_id)) OR
        (role = 'parent' AND user_id = (SELECT parent_user_id FROM relationships WHERE id = relationship_id))
    ),
    CHECK (
        (role = 'child' AND (SELECT child_user_id FROM relationships WHERE id = relationship_id) IS NOT NULL) OR
        (role = 'parent' AND (SELECT parent_user_id FROM relationships WHERE id = relationship_id) IS NOT NULL)
    )
);

-- Create indexes
CREATE INDEX idx_answers_relationship_id ON answers(relationship_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_relationships_hash_code ON relationships(hash_code);
CREATE INDEX idx_relationships_child_user_id ON relationships(child_user_id);
CREATE INDEX idx_relationships_parent_user_id ON relationships(parent_user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read answers" ON answers;
DROP POLICY IF EXISTS "Allow public create answers" ON answers;
DROP POLICY IF EXISTS "Allow public read relationships" ON relationships;
DROP POLICY IF EXISTS "Allow public create relationships" ON relationships;
DROP POLICY IF EXISTS "Allow public read questions" ON questions;
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public create profiles" ON profiles;

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

-- Questions: 누구나 읽기 가능
CREATE POLICY "Allow public read questions" ON questions
    FOR SELECT USING (true);

-- Answers: 누구나 읽기/쓰기 가능
CREATE POLICY "Allow public read answers" ON answers
    FOR SELECT USING (true);
CREATE POLICY "Allow public create answers" ON answers
    FOR INSERT WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nickname)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'nickname'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Insert dummy relationships
INSERT INTO relationships (hash_code, child_user_id, parent_user_id) VALUES
    ('abc123', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- Insert dummy answers
INSERT INTO answers (relationship_id, question_id, user_id, answer_text, role) VALUES
    (
        (SELECT id FROM relationships WHERE hash_code = 'abc123'),
        (SELECT id FROM questions WHERE text = '오늘 하루 중 가장 기억에 남는 순간은 무엇인가요?'),
        '00000000-0000-0000-0000-000000000001',
        '오늘 아침에 엄마가 만들어주신 따뜻한 아침밥이 가장 기억에 남아요. 평소에는 바빠서 함께 식사할 시간이 없었는데, 오늘은 특별히 시간을 내서 함께 식사할 수 있어서 좋았어요.',
        'child'
    ),
    (
        (SELECT id FROM relationships WHERE hash_code = 'abc123'),
        (SELECT id FROM questions WHERE text = '오늘 하루 중 가장 기억에 남는 순간은 무엇인가요?'),
        '00000000-0000-0000-0000-000000000002',
        '아이가 오랜만에 집에 와서 함께 식사하는 모습이 가장 기억에 남아요. 평소에는 각자 바쁘다 보니 함께하는 시간이 적었는데, 오늘은 특별한 시간을 가질 수 있어서 행복했어요.',
        'parent'
    ); 