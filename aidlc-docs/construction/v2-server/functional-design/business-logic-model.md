# 비즈니스 로직 모델 — U3 v2-server

저장 백엔드: **JSON 파일**(Q1=A). 계층형: 라우터 → 서비스 → 저장소. shared-core 재사용(NFR-7).

## 계층 흐름
```
[WebClient(브라우저, V1 UI 재사용)]
    │  fetch (REST/JSON)
    ▼
[ApiRouter]  →  [ReportService]  →  shared-core(파서/필터/판별/집계)
                     │
                     └→ [FileStatusRepository] → data/status.json
```

## API 엔드포인트
- `POST /api/process` — 업로드된 파일(멀티파트) 또는 CSV 텍스트를 받아 판별 결과 + 요약 + 과별 집계 반환. 서버에 저장된 상태를 병합.
- `GET /api/summary` — 현재 세션 결과의 과별 집계(상태별 포함) 반환.
- `PUT /api/status/:noteId` — body { status, user } 로 진행 상태 갱신(FileStatusRepository).
- `GET /api/status` — 전체 상태 맵 반환.

## 서비스(ReportService)
- `processUpload(records)`: shared-core `processRecords`로 판별/집계, 저장된 상태 병합.
- `updateStatus(noteId, status, user)`: 검증 후 저장소 위임, updatedBy=user 기록.
- `getStatusMap()`, `getSummary(results)`.

## 저장소(FileStatusRepository, StatusRepository 구현)
- `data/status.json`에 { noteId: {status, updatedBy, updatedAt} } 저장.
- 쓰기는 순차 처리(간단한 큐/동기 쓰기)로 파일 경합 완화.

## 세션 데이터 처리(프로토타입)
- 업로드된 판별 결과는 서버 메모리에 최근 1건 보관(마지막 업로드). 진행 상태만 파일로 영속.
- 여러 사용자가 같은 데이터셋을 업로드/조회하는 내부 사용 전제.

## 클라이언트(WebClient)
- V1 UI(uploadView/summaryDashboard/followUpTable) 재사용.
- 상태 접근을 `ServerStatusRepository`(fetch 구현)로 주입 → UI 코드 불변(Q4=B).
- 접속 시 이름/과 입력(로그인 없음, FR-V2-2) → 상태 변경 시 user로 전달.
