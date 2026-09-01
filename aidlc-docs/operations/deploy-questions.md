# V2 배포 확인 질문

무료 배포를 위해 아래를 확인해 주세요. `[Answer]:` 뒤에 보기 알파벳으로 답해 주세요.

## 질문 1 — 배포 플랫폼
어떤 무료 플랫폼으로 배포할까요?

A) Render (무료 웹 서비스) — 신용카드 불필요, GitHub 연동 또는 blueprint로 가장 쉬움. 15분 미사용 시 슬립(콜드 스타트 ~1분). (권장)

B) Fly.io — 컨테이너(Docker) 기반, 슬립 없음에 가깝게 구성 가능하나 CLI/Docker 설정 필요, 카드 등록 요구.

C) Koyeb — 컨테이너 기반 무료 티어, 카드 불필요하나 설정이 A보다 약간 복잡.

D) 아직 안 정함 — 추천(A)대로 진행

X) 기타 (아래 [Answer]: 뒤에 설명해 주세요)

[Answer]: a

## 질문 2 — 진행 상태 영속성
무료 티어는 파일 저장이 재배포/재시작 시 초기화됩니다. 진행 상태를 어떻게 할까요?

A) 그대로 둠 (JSON 파일) — 데모/발표용. 재시작 시 상태 초기화되어도 괜찮음 (가장 빠른 배포, 코드 변경 없음)

B) 무료 외부 DB 연동 — 예: 무료 Postgres/Redis(예: Neon/Upstash)로 상태 영속화 (코드에 저장소 어댑터 1개 추가 필요, 배포 복잡도 ↑)

X) 기타 (아래 [Answer]: 뒤에 설명해 주세요)

[Answer]: a

## 질문 3 — 데이터/공개 범위 (중요)
공개 URL로 배포하면 인증 없이 누구나 접근합니다. 어떤 데이터로 운영할까요?

A) 가상 예시 데이터(sample-data/clinical_notes.csv)만 사용 — 데모/학습용, 실제 환자정보 없음 (권장)

B) 실제 환자 데이터도 사용 예정 — 이 경우 공개 배포는 부적합(접근 제어·보안 검토 필요). 사설/내부 배포 재검토 권장.

X) 기타 (아래 [Answer]: 뒤에 설명해 주세요)

[Answer]: a

## 질문 4 — 배포 방식
Render(A 선택 시) 어떤 방식으로 배포할까요?

A) GitHub 저장소에 푸시 후 Render 대시보드에서 연결 (가장 일반적). 제가 `render.yaml` + 배포 가이드를 만들어 드림

B) 저는 배포 설정 파일/가이드만 필요, 나머지는 직접 진행

X) 기타 (아래 [Answer]: 뒤에 설명해 주세요)

[Answer]: a


---
## 결정 (사용자 "배포 해줘" → 추천 구성 채택)
- Q1=A Render 무료 웹 서비스
- Q2=A JSON 그대로(데모용, 무료 티어 비영속 감수)
- Q3=A 가상 예시 데이터만 사용
- Q4=A GitHub 연동 + render.yaml 생성

## 에이전트가 수행한 배포 준비 (완료)
- package.json: start=tsx, postinstall=vite build, tsx/vite를 dependencies로 이동, engines.node>=18
- server.ts: 0.0.0.0 바인딩 + PORT 유지
- render.yaml(루트), .gitignore(루트) 생성
- 검증: NODE_ENV=production 설치→postinstall이 public/ 빌드, PORT=10000 기동, GET / 200, 에셋 200, POST /api/process 200

## 사용자 직접 수행 필요 (계정 필요)
- GitHub 푸시 + Render 계정에서 Blueprint 연결(가이드: deploy-render-guide.md)
