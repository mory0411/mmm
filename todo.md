# MORY TODO (MVP 기준)

## 1. 프로젝트 세팅
- [x] Next.js 15 프로젝트 생성 (App Router)
- [x] TailwindCSS 및 Shadcn UI 설치/설정
- [x] Supabase 프로젝트 및 DB 연동
- [x] .env.local 환경변수 설정
- [x] git 브랜치 전략 세팅 (on, main, feature/*, hotfix/*)

---

## 2. 인증 및 프로필
- [ ] Supabase Auth + Kakao OAuth 연동
- [ ] 로그인/로그아웃 기능 구현
- [ ] 최초 로그인 시 닉네임 동기화
- [ ] 자동 로그인/세션 관리
- [ ] 프로필 정보 조회/수정 UI

---

## 3. DB 및 데이터 구조
- [x] sync.sql 기반 DB 마이그레이션 적용
- [x] RLS 정책 및 더미 데이터 적용 확인
- [x] profiles, relationships, questions, answers 테이블 정상 동작 확인
- [ ] 관계 생성 시 child/parent 역할 제약조건 검증
- [ ] 답변 500자 제한, 역할 검증, 수정 불가 로직 확인

---

## 4. 주요 페이지 및 라우팅
- [x] / (메인): 서비스 소개, 시작하기 버튼
- [ ] /auth/login: 카카오 로그인 버튼, 리다이렉트 처리
- [ ] /auth/callback: OAuth 콜백 처리
- [ ] /app: 대시보드(참여 중인 관계 목록, 새 관계 생성)
- [ ] /app/r/[hash]: 공유 링크 접속, 역할 선택, 질문/답변, 타임라인
- [ ] /app/create: 새로운 관계 생성, 역할 선택, 링크 복사
- [ ] /app/history/[hash]: 관계별 Q&A 히스토리, 날짜/키워드 필터
- [ ] /app/settings: 프로필 설정, 로그아웃
- [ ] 각 페이지별 loading, error 처리

---

## 5. 컴포넌트 구조 (shadcn 우선)
- [ ] auth/LoginButton
- [ ] auth/RoleSelectModal
- [ ] questions/QuestionCard
- [ ] questions/AnswerInput
- [ ] timeline/TimelineItem
- [ ] timeline/TimelineList
- [ ] ui/Button, Card, Modal, Loading, ErrorBoundary

---

## 6. 서버/클라이언트 데이터 처리
- [ ] supabase client.ts, auth.ts 구현
- [ ] SSR: 관계/질문/답변 데이터 로드
- [ ] Server Actions: 관계 생성, 답변 저장, 역할 검증 트랜잭션
- [ ] 실시간 구독(answers)로 답변 알림 UI
- [ ] React Context로 관계/역할/답변 상태 관리
- [ ] 로컬 스토리지에 역할 정보 저장 및 복원
- [ ] 유틸(date, validation 등) 함수 구현

---

## 7. 스타일/UX
- [x] Tailwind 커스텀 테마 적용 (따뜻한 분위기)
- [ ] 모바일 우선 반응형 레이아웃 (구체적 구현 미확인)
- [ ] 감성적 애니메이션 (답변 제출 등)
- [ ] 접근성 고려

---

## 8. 테스트/배포
- [ ] 주요 기능 단위 테스트
- [ ] E2E 테스트 (관계 생성~답변까지 전체 플로우)
- [ ] Vercel 배포 및 환경변수 세팅
- [ ] Supabase 보안 옵션(Leaked Password, MFA 등) 점검

---

## 9. 문서화
- [x] README 작성 (설치, 개발, 배포, 구조 설명)
- [x] PRD, ERD, todo 최신화 