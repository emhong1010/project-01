# 프론트엔드 컴포넌트 설계 — U2 v1-web-serverless

기술: TypeScript + Vite (바닐라 DOM). shared-core를 상대경로로 import. 상태 접근은 `StatusRepository` 계약으로 추상화(V2 재사용 대비).

## 컴포넌트 계층
```
App (main.ts)
├── UploadView            # 파일 선택/업로드, 오류 표시
├── SummaryDashboard      # 전체 요약 + 과별 건수 + 과 선택 탭
└── FollowUpTable         # 선택 과의 추적관찰 필요 건 표(상태 변경, 원문 토글)
```

## App (main.ts) — 오케스트레이션 + 앱 상태
- **상태(state)**:
  - `results: DetectionResult[]` (판별 결과)
  - `summary: OverallSummary`, `byDept: DepartmentSummary[]`
  - `selectedDept: string | '전체'`
  - `statuses: Record<noteId, StatusEntry>` (repository에서 로드)
  - `repo: StatusRepository` (V1은 LocalStorageStatusRepository)
- **흐름**: 업로드 → parseCsv/xlsx → processRecords → 상태 병합 → 렌더.

## UploadView
- **props/입력**: onLoaded(results, summary, byDept), onError(message)
- **상호작용**: `<input type=file>` (CSV/xlsx). 파일 읽어 코어 호출.
- **오류 표시**: MissingColumnError/EmptyFileError를 한국어 메시지로 (FR-12).
- **data-testid**: `upload-input`, `upload-error`

## SummaryDashboard
- **props**: summary, byDept, selectedDept, onSelectDept(dept)
- **표시**: 전체 판독문 수/추적관찰 필요 수/제외 수, 과별 필요 건수(막대 or 표), 과 선택 탭("전체" + 각 과).
- **상호작용**: 탭 클릭 → onSelectDept.
- **data-testid**: `dept-tab-{dept}`, `summary-total`, `summary-followup`

## FollowUpTable
- **props**: results(필터: 선택 과 & isFollowUpNeeded), statuses, onStatusChange(noteId, status), 펼침 상태
- **열**: 식별자(noteId), 진행상태(select: 대기/진행중/완료), 유형(권고형/판단형), 근거 문장(상시), 추적시점, 검사종류/부위, 작성일, 원문(펼치기 토글)
- **상호작용**:
  - 상태 select 변경 → onStatusChange → repo.setStatus → 로컬 state 갱신 → 대시보드 재집계
  - 원문 "펼치기" 버튼 → 해당 행 원문 전체 표시 토글
- **data-testid**: `followup-row-{noteId}`, `status-select-{noteId}`, `toggle-fulltext-{noteId}`

## 저장소 어댑터: LocalStorageStatusRepository
- `StatusRepository` 구현. 단일 키 `followup-status`에 `{ noteId: {status, updatedAt} }` 맵 저장(Q2=A).
- V2에서는 이 자리에 fetch 기반 구현을 주입(UI 코드 불변, Q4=B).

## API/저장소 연동 지점
- 상태 변경만 저장소 사용. 판별/집계는 shared-core 순수 함수 호출(네트워크 없음).
