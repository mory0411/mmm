# MORY PRD (프로덕트 요구사항 문서)

## 1. 프로젝트 개요

### 서비스명: MORY

### 목표
- 살아계신 가족과의 대화 증진
- 소중한 추억 기록 및 아카이브 제공

### 슬로건
기억은 관계를 잇는 매개체

### 주요 타깃
20~40대 자녀 세대 (부모·조부모와 소통 및 관계 회복을 원하는 사용자)

### 프로젝트 배경
- 가족 간 소통 부족 문제를 해결
- 세대 간 정서적 연결을 강화하는 디지털 도구 제공

### 비전
가족 간 대화를 촉진하고, 시간이 지나도 추억을 되새길 수 있는 디지털 기록 구축

## 2. 핵심 기능 (MVP)

### 2.1 User Flow

#### 인증
**카카오 로그인:**
- 카카오 계정으로 간편 로그인
- 최초 로그인 시 닉네임만 동기화
- 로그인 상태 유지 (자동 로그인)

#### 웹사이트 진입
**공유 링크 접속:**
- 고유 링크(예: mory.com/r/abc123)로 접속
- 관계와 역할 정보 자동 로드 (첫 접속 시 역할 선택 필요)

**일반 접속:**
- 메인 페이지에서 새로운 관계 생성 시작
- 역할 선택 후 공유 링크 생성

#### 관계 설정
**첫 번째 사용자 (관계 생성자):**
- 역할 선택 (자녀/부모)
- 선택한 역할에 따라 child_user_id 또는 parent_user_id로 자동 설정
- 오늘의 질문 확인 및 답변 입력
- 단일 공유 링크 생성

**두 번째 사용자 (초대된 사용자):**
- 공유 링크로 접속
- 남은 역할로 자동 할당 (첫 번째 사용자가 자녀이면 부모로, 부모이면 자녀로)
- child_user_id 또는 parent_user_id로 자동 설정
- 동일한 질문에 답변 입력

#### 답변하기
- 오늘의 질문 자동 표시
- 답변 입력 시 자동으로 올바른 역할 검증
- 답변자는 반드시 해당 관계의 child_user_id 또는 parent_user_id와 일치해야 함
- 답변 수정 불가 (진정성 보장)
- 최대 500자 제한 (DB 제약조건으로 보장)

#### 지금까지의 답변 보기
- 관계 내 모든 Q&A를 타임라인 형식으로 제공
- 질문, 답변, 역할, 작성 날짜 포함
- 간단한 필터링 (예: 날짜 범위, 질문 카테고리)

#### UI/UX 고려사항
- 직관적인 단일 페이지 레이아웃: 상단에 답변 입력, 하단에 과거 대화 미리보기
- 감성적 디자인: 따뜻한 색상, 부드러운 애니메이션 (예: 답변 제출 시 페이드인)
- 모바일 최적화: 터치 친화적 인터페이스

### 2.2 주요 기능

#### 인증 시스템
- Supabase Auth + Kakao OAuth 연동
- 사용자 닉네임 관리
- 자동 로그인 및 세션 관리

#### 모바일 우선 반응형 웹
- Next.js와 TailwindCSS, Shadcn으로 구현
- 모바일 환경에서 빠르고 직관적인 경험 제공

#### 단일 공유 링크
- relationships 테이블의 hash_code 컬럼을 통한 고유 식별자 제공
- 관계 ID와 역할 정보 포함 (암호화된 해시)
- 링크는 만료되지 않음 (관계 지속 기간 동안 사용 가능)

#### 역할 관리
- 첫 접속 시 역할 선택 (자녀/부모)
- 역할 정보는 DB의 relationships 테이블에 직접 저장
- 한 관계에서 자녀와 부모는 각각 한 명만 가능 (DB 제약조건으로 보장)
- 역할 변경 불가 (데이터 무결성 보장)

#### 답변하기
- 오늘의 질문 자동 표시
- 답변 입력 시 자동으로 올바른 역할 검증
- 답변자는 반드시 해당 관계의 child_user_id 또는 parent_user_id와 일치해야 함
- 답변 수정 불가 (진정성 보장)
- 최대 500자 제한 (DB 제약조건으로 보장)

#### 지금까지의 답변 보기
- 관계 내 모든 Q&A를 타임라인 형식으로 제공
- 질문, 답변, 역할, 작성 날짜 포함
- 간단한 필터링 (예: 날짜 범위, 질문 카테고리)

#### 알림 기능
- 상대방 답변 완료 시 UI 내 배지 또는 강조 표시
- (선택) 이메일/SMS 알림 확장 가능성 열어둠

## 3. DB 구조 (Supabase)

### Auth & Profiles
- auth.users: Supabase Auth 기본 테이블
- profiles: 사용자 프로필 정보
  - id (PK, UUID): auth.users 참조
  - nickname (VARCHAR): 카카오 닉네임
  - created_at (TIMESTAMP): 생성 시간

### Relationships
- id (PK, UUID): 고유 관계 식별자
- hash_code (VARCHAR, UNIQUE): 고유 해시 코드 (예: abc123)
- child_user_id (UUID): 자녀 사용자 ID (auth.users 참조, NULL 가능)
- parent_user_id (UUID): 부모 사용자 ID (auth.users 참조, NULL 가능)
- created_at (TIMESTAMP): 관계 생성 시간
- 제약조건: child_user_id와 parent_user_id는 서로 다른 사용자여야 함

### Questions
- id (PK, UUID): 질문 고유 식별자
- text (TEXT): 질문 내용
- created_at (TIMESTAMP): 질문 생성 시간

### Answers
- id (PK, UUID): 답변 고유 식별자
- relationship_id (FK → Relationships.id): 연관된 관계
- question_id (FK → Questions.id): 연관된 질문
- user_id (FK → auth.users.id): 답변 작성자
- answer_text (TEXT, 최대 500자): 답변 내용
- role (ENUM: 'child', 'parent'): 작성자 역할
- created_at (TIMESTAMP): 답변 작성 시간

## 4. 기술 스택

### Frontend & Backend
- Next.js 15 (App Router)
- Server Components와 Server Actions 활용

### Styling
- TailwindCSS (모바일 우선, 감성적 디자인)
- 커스텀 테마로 따뜻한 분위기 연출

### DB
- Supabase (PostgreSQL)
- 실시간 데이터 동기화 지원 (알림 기능 대비)

### 배포
- Vercel (프론트엔드 + 백엔드 통합)
- 자동화된 CI/CD 파이프라인

### 아키텍처
- Server Components: 초기 데이터 로드 및 SSR
- Server Actions: 데이터 생성/업데이트
- 최소화된 클라이언트 측 렌더링

### 인증
- Supabase Auth
- Kakao OAuth 2.0
- JWT 기반 세션 관리

## 5. 페이지 구조 (App Router)

### / (메인 페이지)
- 서비스 소개
  - 슬로건: "기억은 관계를 잇는 매개체"
  - 주요 기능 소개
  - 사용 방법 안내
- 시작하기 버튼
  - 비로그인: 카카오 로그인 유도
  - 로그인: 관계 생성 페이지로 이동

### /auth
- /auth/login
  - 카카오 로그인 버튼
  - 로그인 후 리다이렉트 처리
- /auth/callback
  - 카카오 OAuth 콜백 처리
  - 로그인 성공/실패 처리

### /app
- /app/page.tsx
  - 로그인한 사용자의 대시보드
  - 참여 중인 관계 목록
  - 새로운 관계 생성 버튼
- /app/layout.tsx
  - 공통 레이아웃 (네비게이션 바)
  - 로그인 상태에 따른 UI 처리

### /app/r
- /app/r/[hash]/page.tsx
  - 공유 링크 접속 페이지
  - 역할 선택 모달 (첫 접속 시)
  - 오늘의 질문 표시
  - 답변 입력 섹션
  - 과거 대화 타임라인
- /app/r/[hash]/loading.tsx
  - 로딩 상태 UI
- /app/r/[hash]/error.tsx
  - 에러 처리 페이지

### /app/create
- /app/create/page.tsx
  - 새로운 관계 생성 페이지
  - 역할 선택 (자녀/부모)
  - 공유 링크 생성 및 복사 기능

### /app/history
- /app/history/[hash]/page.tsx
  - 관계별 과거 대화 히스토리
  - 날짜별 정렬
  - 질문 키워드 검색

### /app/settings
- /app/settings/page.tsx
  - 프로필 설정
  - 로그아웃 기능

### 공통 컴포넌트
- components/
  - auth/
    - LoginButton.tsx
    - RoleSelectModal.tsx
  - questions/
    - QuestionCard.tsx
    - AnswerInput.tsx
  - timeline/
    - TimelineItem.tsx
    - TimelineList.tsx
  - ui/
    - Button.tsx
    - Card.tsx
    - Modal.tsx
    - Loading.tsx
    - ErrorBoundary.tsx

### 유틸리티
- lib/
  - supabase/
    - client.ts
    - auth.ts
  - utils/
    - date.ts
    - validation.ts

### 스타일
- styles/
  - globals.css
  - theme.ts (Tailwind 설정)

## 6. 데이터 처리

### 서버 사이드 데이터 처리
**Server Components:**
- 공유 링크 해시로 관계, 질문, 답변 데이터 조회
- 사용자 역할 자동 검증 (DB 제약조건 활용)
- SSR로 빠른 초기 렌더링

**Server Actions:**
- 관계 생성 시 역할 기반으로 child_user_id 또는 parent_user_id 설정
- 답변 저장 시 사용자 역할 검증
- 트랜잭션으로 데이터 무결성 보장

### 클라이언트 상태 관리
- React Context: 현재 관계, 역할, 답변 상태 관리
- 로컬 스토리지: 역할 정보 저장 (재접속 시 복원)
- URL 파라미터: 해시 코드로 관계 식별

### 페이지 새로고침 시
- SSR로 데이터 복원
- 로컬 스토리지에서 역할 정보 로드

### 실시간 업데이트
- Supabase 실시간 구독으로 상대방 답변 알림 구현

## 7. 서버 액션 스펙 (Next.js Server Actions)

### 초기 데이터 로드
- GET /api/init/[hash]: 해시로 관계, 질문, 답변 데이터 조회

### 관계 생성
- POST /api/relationships
- Request Body:
  ```json
  {
    "role": "child" | "parent",
    "hash_code": "string"
  }
  ```
- Response:
  ```json
  {
    "id": "uuid",
    "hash_code": "string",
    "child_user_id": "uuid" | null,
    "parent_user_id": "uuid" | null
  }
  ```

### 오늘의 질문 조회
- GET /api/questions/today: 당일 질문 반환

### 답변 등록
- POST /api/answers: 답변 저장 및 알림 트리거

### 과거 Q&A 조회
- GET /api/history/[hash]: 관계 내 모든 Q&A 반환

## 8. 개발 프로세스

### 브랜치 전략
- `on`: 개발 브랜치 (기능 개발 및 테스트)
- `main`: 프로덕션 브랜치 (배포용)
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

### 개발 워크플로우
1. `on` 브랜치에서 개발 시작
2. 기능 개발 시 `feature/*` 브랜치 생성
3. 개발 완료 후 `on` 브랜치로 병합
4. 테스트 완료 후 `main` 브랜치로 병합 및 배포
