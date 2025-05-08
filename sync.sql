-- Drop existing tables if they exist
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS relationship_names CASCADE;
DROP TABLE IF EXISTS question_history CASCADE;

-- =====================
-- 테이블 생성
-- =====================

-- 사용자 프로필
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    nickname VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 부모-자녀 관계
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hash_code VARCHAR UNIQUE NOT NULL,
    child_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    parent_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 질문
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 답변
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

-- 관계별 별칭
CREATE TABLE relationship_names (
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (relationship_id, user_id)
);

-- 질문 히스토리 (관계별 질문 상태 관리)
CREATE TABLE question_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('done', 'not_done', 'today', '1-reply', '2-reply')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (relationship_id, question_id)
);

-- =====================
-- RLS 및 정책
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_history ENABLE ROW LEVEL SECURITY;

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
    (parent_user_id IS NULL OR parent_user_id = auth.uid())
    OR
    (child_user_id IS NULL OR child_user_id = auth.uid())
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

-- 질문 히스토리 RLS 정책 (MVP 단계에서는 모든 작업 허용)
CREATE POLICY "Allow all operations on question_history" ON question_history
    FOR ALL USING (true);

-- =====================
-- 함수 정의
-- =====================

-- 일일 상태 업데이트 함수: 각 관계별로 not_done 중 1개를 today로, 2-reply는 done으로, today/1-reply는 not_done으로 변경
CREATE OR REPLACE FUNCTION update_question_statuses()
RETURNS void AS $$
BEGIN
    -- today, 1-reply를 not_done으로 변경
    UPDATE question_history
    SET status = 'not_done'
    WHERE status IN ('today', '1-reply');

    -- 2-reply를 done으로 변경
    UPDATE question_history
    SET status = 'done'
    WHERE status = '2-reply';

    -- 각 관계별로 not_done 중 랜덤 1개를 today로 변경
    WITH rels AS (
        SELECT DISTINCT relationship_id FROM question_history
    ),
    random_questions AS (
        SELECT qh.id
        FROM rels
        JOIN LATERAL (
            SELECT id
            FROM question_history
            WHERE relationship_id = rels.relationship_id AND status = 'not_done'
            ORDER BY RANDOM()
            LIMIT 1
        ) qh ON TRUE
    )
    UPDATE question_history
    SET status = 'today'
    WHERE id IN (SELECT id FROM random_questions);
END;
$$ LANGUAGE plpgsql;

-- 모든 질문을 특정 관계의 question_history에 not_done으로 추가하는 함수
CREATE OR REPLACE FUNCTION add_all_questions_to_history(rel_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO question_history (relationship_id, question_id, status)
  SELECT rel_id, q.id, 'not_done'
  FROM questions q
  WHERE NOT EXISTS (
    SELECT 1 FROM question_history
    WHERE relationship_id = rel_id AND question_id = q.id
  );
END;
$$ LANGUAGE plpgsql;