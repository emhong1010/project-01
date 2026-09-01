# v2-server

판독문 추적관찰 도구의 **V2 (서버 기반, 최종형)** 입니다. Node.js + TypeScript 서버가 진행 상태를 JSON 파일에 저장해 **여러 과 선생님이 공유**합니다. 클라이언트는 V1 UI를 재사용하며 저장 계층만 서버 API로 교체합니다.

## 역할
- REST API로 판독문 처리(판별/집계) 및 진행 상태 공유 저장
- V1 UI 재사용 + 접속 시 이름/과 입력(로그인 없음)

## 폴더 구조 (계층형)
```
v2-server/
├── src/
│   ├── server.ts                     # HTTP 서버(정적 + /api/*)
│   ├── router.ts                     # 라우터 계층(REST 엔드포인트)
│   ├── service/reportService.ts      # 서비스 계층(shared-core 오케스트레이션)
│   ├── repository/fileStatusRepository.ts  # 저장소 계층(JSON 파일, StatusRepository)
│   └── client/                       # 재사용 클라이언트
│       ├── index.html
│       ├── main.ts                   # V1 뷰 재사용 + ServerStatusRepository 주입
│       └── serverStatusRepository.ts # StatusRepository의 fetch 구현
├── public/                           # 클라이언트 빌드 산출물(서버가 서빙)
├── data/status.json                  # 진행 상태 저장(런타임 생성)
└── tests/
```

## API
- `POST /api/process` — { csv } 또는 { records } → 판별 결과 + 요약 + 과별 집계
- `GET /api/status` — 전체 진행 상태 맵
- `GET /api/summary` — 과별 집계(상태별 포함)
- `PUT /api/status/:noteId` — { status, user } 진행 상태 갱신

## shared-core / V1 재사용
- 판별/집계: `../shared-core` 재사용(NFR-7)
- UI: `../v1-web-serverless/src/views/*` 재사용, 저장만 서버 어댑터로 교체(Q4=B)

## 실행
```bash
npm install
npm run build:client   # 클라이언트를 public/으로 빌드
npm start              # 서버 실행 (기본 http://localhost:3000)
# 개발: npm run dev
npm test               # 단위 테스트
npm run typecheck
```

## 사용법
1. `npm run build:client && npm start`
2. 브라우저에서 서버 주소 접속 → 이름/과 입력 후 "시작"
3. 판독문 CSV/Excel 업로드 → 과별 대시보드/표 확인
4. 진행 상태 변경 시 서버에 저장되어 다른 사용자와 공유
