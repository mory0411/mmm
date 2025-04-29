-- 역할 ENUM 타입 정의
CREATE TYPE role_type AS ENUM ('child', 'parent');

-- Relationships 테이블
CREATE TABLE Relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Questions 테이블
CREATE TABLE Questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Answers 테이블
CREATE TABLE Answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID NOT NULL,
    question_id UUID NOT NULL,
    answer_text TEXT NOT NULL CHECK (LENGTH(answer_text) <= 500),
    role role_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (relationship_id) REFERENCES Relationships(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Questions(id) ON DELETE RESTRICT,
    CONSTRAINT unique_answer_per_question UNIQUE (relationship_id, question_id, role)
);

-- ShareLinks 테이블
CREATE TABLE ShareLinks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID NOT NULL,
    hash_code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (relationship_id) REFERENCES Relationships(id) ON DELETE CASCADE
); 