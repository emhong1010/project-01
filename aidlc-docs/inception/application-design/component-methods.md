# 컴포넌트 메서드 시그니처 (Component Methods)

> 타입은 개념적 시그니처입니다. 상세 비즈니스 규칙(판별 키워드 목록, 시점 정규식 등)은 기능 설계 단계에서 확정합니다.

## 공통 데이터 타입 (개념)
```
RawRecord = { [column: string]: string }   // 파싱된 원시 행 (열 이름 → 값)

Report = {
  noteId: string
  noteType: string       // "판독문"
  noteDate: string       // YYYY-MM-DD
  dept: string           // 진료과
  modality: string       // CT/MR/CR
  bodyPart: string
  authorRole: string
  text: string           // 원문
}

DetectionResult = {
  report: Report
  isFollowUpNeeded: boolean
  matchedKeywords: string[]      // 판별에 사용된 키워드
  evidenceSentences: string[]    // 근거 문장
  followUpTiming: string | null  // 추적 시점/기간 (예: "3개월 후"), 없으면 null
}

FollowUpStatus = "대기" | "진행중" | "완료"

StatusEntry = { status: FollowUpStatus, updatedBy?: string, updatedAt?: string }

DepartmentSummary = {
  dept: string
  followUpCount: number
  statusCounts?: { 대기: number, 진행중: number, 완료: number }
}
```

## C1. FileParser
- `parseCsv(text: string): RawRecord[]` — 따옴표/멀티라인 필드 안전 파싱.
- `parseXlsx(bytes: ArrayBuffer | Buffer): RawRecord[]`
- `toReports(records: RawRecord[]): Report[]` — 열 매핑(누락 열 시 오류).

## C2. NoteFilter
- `filterReports(reports: Report[]): { reports: Report[]; excludedCount: number }`

## C3. FollowUpDetector
- `detect(report: Report): DetectionResult`
- `detectMany(reports: Report[]): DetectionResult[]`
- (내부) `matchRules(text: string): { matched: string[]; evidence: string[] }`
- (내부) `extractTiming(text: string): string | null`

## C5. SectionExtractor
- `extractSections(text: string): { exam: string; clinicalInfo: string; findings: string; conclusion: string }`

## C4. DepartmentAggregator
- `aggregateByDept(results: DetectionResult[], statuses?: Record<string, StatusEntry>): DepartmentSummary[]`
- `overallSummary(results: DetectionResult[]): { totalReports: number; totalFollowUp: number }`

## StatusRepository (C9 / C12 / C13 구현)
- `getStatus(noteId: string): FollowUpStatus | undefined` (V2는 Promise 허용)
- `setStatus(noteId: string, status: FollowUpStatus, meta?: { updatedBy?: string }): void | Promise<void>`
- `getAll(): Record<string, StatusEntry> | Promise<Record<string, StatusEntry>>`

## C11. ReportService (V2)
- `processUpload(fileData): { results: DetectionResult[]; summary }`
- `updateStatus(noteId, status, user): Promise<void>`
- `getSummary(): Promise<DepartmentSummary[]>`

## C10. ApiRouter (V2 엔드포인트)
- `GET /api/reports` → DetectionResult[] (+ 현재 상태 병합)
- `GET /api/summary` → DepartmentSummary[]
- `PUT /api/status/:noteId` (body: { status, user }) → 200/오류

## UI (C6~C8) 개념 메서드
- UploadView: `onFileSelected(file)` → 파서 호출 → onParsed(results)/onError(msg)
- DashboardView: `render(summary, depts)`, `onSelectDept(dept)`
- FollowUpTableView: `render(results, statuses, selectedDept)`, `onStatusChange(noteId, status)`, `onToggleFullText(noteId)`
