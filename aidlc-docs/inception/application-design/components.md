# 컴포넌트 정의 (Components)

설계 결정 요약: 코어는 기능별 분리(Q1=A), 플랫폼 독립 순수 로직(Q2=A), V2는 계층형(Q3=A), UI는 V1 먼저→V2 재사용·저장 계층만 교체(Q4=B).

---

## 유닛 1: shared-core (공통 코어, 플랫폼 독립 TypeScript)

### C1. FileParser
- **목적**: CSV/Excel 원본(문자열 또는 바이트)을 구조화된 레코드 배열로 파싱.
- **책임**: 쉼표·줄바꿈이 포함된 따옴표 필드 처리, 헤더 매핑, 필수 열 확인.
- **인터페이스**: `parseCsv(text) -> RawRecord[]`, `parseXlsx(bytes) -> RawRecord[]`
- **비의존**: 파일 I/O(디스크/업로드)는 담당하지 않음 — 입력은 이미 읽힌 데이터.

### C2. NoteFilter
- **목적**: 판독문만 남기고 다른 기록(간호기록/경과기록)을 제외.
- **책임**: `note_type == "판독문"` 필터, 제외 건수 리포트.
- **인터페이스**: `filterReports(records) -> { reports, excludedCount }`

### C3. FollowUpDetector
- **목적**: 판독문 본문에서 추적 관찰 필요 여부를 규칙 기반으로 판별하고 근거·시점을 추출.
- **책임**: `[소견]/[결론]` 섹션 대상 키워드/패턴 매칭, `[임상정보]` 제외, 부정 표현 제외, 근거 문장·추적 시점/기간 추출.
- **규칙 집중화(NFR-4)**: 판별 규칙(키워드/패턴)을 이 컴포넌트의 규칙 정의 파일 한 곳에 모음.
- **인터페이스**: `detect(report) -> DetectionResult`

### C4. DepartmentAggregator
- **목적**: 판별 결과를 진료과(`dept`)별로 집계.
- **책임**: 과별 추적관찰 필요 건수, (선택) 상태별 건수 집계.
- **인터페이스**: `aggregateByDept(results) -> DepartmentSummary[]`

### C5. SectionExtractor (내부 유틸)
- **목적**: 본문에서 `[검사]/[임상정보]/[소견]/[결론]` 섹션을 분리.
- **책임**: FollowUpDetector가 오탐 방지를 위해 소견/결론만 검사하도록 지원.
- **인터페이스**: `extractSections(text) -> { exam, clinicalInfo, findings, conclusion }`

---

## 유닛 2: v1-web-serverless (브라우저 UI + localStorage)

### C6. UploadView
- **목적**: 파일 선택/업로드 및 오류 안내 화면.
- **인터페이스(개념)**: 파일 입력 → 코어 파싱 호출 → 결과/오류 표시.

### C7. DashboardView
- **목적**: 전체 요약 + 과별 추적관찰 필요 건수 대시보드, 과 선택 탭.
- **인터페이스(개념)**: 집계 결과 렌더링, 선택 과 상태 관리.

### C8. FollowUpTableView
- **목적**: 선택 과(또는 전체)의 추적관찰 필요 건을 표로 표시, 원문 펼치기, 상태 변경 UI.
- **인터페이스(개념)**: 판별결과+상태 렌더링, 상태 변경 이벤트 발생.

### C9. StatusStore (V1 어댑터)
- **목적**: 진행 상태를 localStorage에 저장/로드.
- **인터페이스**: `StatusRepository` 계약 구현 — `getStatus(id)`, `setStatus(id, status, meta?)`, `getAll()`

---

## 유닛 3: v2-server (Node.js + TypeScript, 계층형) + 클라이언트 연동

### C10. ApiRouter (라우터 계층)
- **목적**: REST 엔드포인트 정의.
- **인터페이스**: `GET /api/reports`(업로드 결과/판별 목록), `PUT /api/status/:noteId`(상태 갱신), `GET /api/summary`(과별 집계).

### C11. ReportService (서비스 계층)
- **목적**: 오케스트레이션 — 코어(파서/필터/판별/집계) 호출 + 저장소 조합.
- **인터페이스**: `processUpload(fileData)`, `updateStatus(noteId, status, user)`, `getSummary()`

### C12. StatusRepository (저장소 계층, V2 어댑터)
- **목적**: 진행 상태를 서버 저장소(경량 DB/JSON 파일)에 영속화, 다중 사용자 공유.
- **인터페이스**: V1과 동일한 `StatusRepository` 계약(플랫폼만 다름).

### C13. WebClient (V2 프론트엔드)
- **목적**: V1의 UI 컴포넌트(C6~C8)를 재사용하되 상태 소스를 서버 API 어댑터로 교체(Q4=B). 접속 시 이름/과 선택.
- **인터페이스**: `StatusRepository`를 fetch 기반으로 구현하여 UI에 주입.

---

## 공유 계약: StatusRepository
V1(C9)과 V2(C12)가 동일하게 구현하는 인터페이스로, UI는 이 계약에만 의존(Q4=B의 교체 지점).
```
interface StatusRepository {
  getStatus(noteId): FollowUpStatus | undefined
  setStatus(noteId, status, meta?): void | Promise<void>
  getAll(): Record<noteId, StatusEntry>
}
```
