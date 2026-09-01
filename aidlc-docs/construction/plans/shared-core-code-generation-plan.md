# 코드 생성 계획 — U1 shared-core

**유닛**: shared-core (플랫폼 독립 순수 TypeScript 코어)
**워크스페이스 루트**: /Users/emhong/013. KIRO/aidlc/project_01
**코드 위치**: `shared-core/` (애플리케이션 코드는 루트 하위, aidlc-docs/ 아님)
**담당 스토리**: US-OP-1~3(파싱/필터/오류), US-DOC-1~3(판별/근거/시점), US-MGR-1~2(집계), US-LRN-2~3(규칙 집중화/재사용)

## 유닛 컨텍스트
- **의존**: 없음(임계 경로).
- **인터페이스(다른 유닛이 사용)**: 타입(Report, DetectionResult, DepartmentSummary, FollowUpStatus, StatusEntry, StatusRepository), 함수(parseCsv, parseXlsx, toReports, filterReports, extractSections, detect/detectMany, aggregateByDept, overallSummary), 규칙 상수.
- **순수성**: 파일/네트워크/저장 I/O 없음.

## 기술 선택 (프로토타입/학습 친화)
- 언어: TypeScript. 브라우저/Node 양쪽에서 쓸 수 있도록 ESM.
- CSV: 외부 의존 없이 RFC4180 방식의 소형 파서 자체 구현(학습 친화 + 의존 최소). Excel(.xlsx)은 파싱 인터페이스만 정의하고 실제 파싱은 소비 유닛에서 라이브러리로 주입(코어 순수성 유지) — V1/V2 코드 생성 시 `xlsx`(SheetJS) 등으로 연결.
- 테스트: Node 내장 `node:test` + `tsx`로 실행(경량, 설정 최소).

## 생성 단계 (체크리스트)

- [x] **Step 1. 프로젝트 구조 설정**: `shared-core/` 생성. `package.json`, `tsconfig.json`, `src/`, `tests/`.
- [x] **Step 2. 타입 정의**: `src/types.ts`.
- [x] **Step 3. 판별 규칙 상수**: `src/rules.ts` (NFR-4 규칙 집중화).
- [x] **Step 4. FileParser**: `src/fileParser.ts` (parseCsv RFC4180, parseXlsx 주입형, toReports 검증/예외).
- [x] **Step 5. NoteFilter**: `src/noteFilter.ts`.
- [x] **Step 6. SectionExtractor**: `src/sectionExtractor.ts`.
- [x] **Step 7. FollowUpDetector**: `src/followUpDetector.ts`.
- [x] **Step 8. DepartmentAggregator**: `src/departmentAggregator.ts`.
- [x] **Step 9. 공개 인덱스**: `src/index.ts` + processRecords 헬퍼.
- [x] **Step 10. 단위 테스트**: `tests/` 18개 통과 + 실데이터 스모크.
- [x] **Step 11. 문서/요약**: `shared-core/README.md` + `aidlc-docs/construction/shared-core/code/summary.md`.

## 스토리 추적
| 스토리 | 구현 위치 |
|---|---|
| US-OP-1 | fileParser(parseCsv/parseXlsx) |
| US-OP-2 | noteFilter |
| US-OP-3 | fileParser(toReports 예외) |
| US-DOC-1 | followUpDetector + sectionExtractor + rules |
| US-DOC-2 | followUpDetector(evidence) |
| US-DOC-3 | followUpDetector(timing) |
| US-MGR-1/2 | departmentAggregator |
| US-LRN-2 | rules.ts(규칙 집중화) |
| US-LRN-3 | 순수 ESM 코어(재사용) |
