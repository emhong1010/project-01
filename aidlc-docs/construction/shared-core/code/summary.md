# 코드 생성 요약 — U1 shared-core

## 생성 파일 (애플리케이션 코드: 워크스페이스 루트 `shared-core/`)
- Created: `shared-core/package.json`, `shared-core/tsconfig.json`, `shared-core/README.md`
- Created: `shared-core/src/types.ts` — 도메인 타입 + StatusRepository 계약
- Created: `shared-core/src/rules.ts` — 판별 규칙 상수(권고형/판단형/부정/시점) — NFR-4 집중화
- Created: `shared-core/src/fileParser.ts` — RFC4180 CSV 파서, toReports(열 검증/예외), Excel 주입 인터페이스
- Created: `shared-core/src/noteFilter.ts` — 판독문 필터
- Created: `shared-core/src/sectionExtractor.ts` — 섹션 분리
- Created: `shared-core/src/followUpDetector.ts` — 판별(R1~R7)
- Created: `shared-core/src/departmentAggregator.ts` — 과별/전체 집계
- Created: `shared-core/src/index.ts` — 공개 API + processRecords 헬퍼
- Created: `shared-core/tests/fileParser.test.ts`, `followUpDetector.test.ts`, `pipeline.test.ts`
- Created: `shared-core/tests/smoke-realdata.ts` — 실데이터 재현용
- Created: `sample-data/clinical_notes.csv` (제공 CSV 복사)

## 검증 결과
- 단위 테스트: 18/18 통과 (`npm test`)
- 타입 체크: 통과 (`npm run typecheck`)
- 실데이터 스모크: 판독문 306건, 추적관찰 필요 196건(권고형 72 + 판단형 124), 제외 182건, 과별 집계 정상

## 스토리 커버리지
- US-OP-1(파싱), US-OP-2(필터), US-OP-3(오류 예외): 완료
- US-DOC-1(판별), US-DOC-2(근거), US-DOC-3(시점): 완료
- US-MGR-1(전체 요약), US-MGR-2(과별 집계): 완료
- US-LRN-2(규칙 집중화 rules.ts), US-LRN-3(순수 재사용 코어): 완료

## 비고
- Excel 파싱은 코어 순수성 유지를 위해 주입형(XlsxToRecords). 실제 xlsx 파싱은 V1/V2 코드 생성 시 라이브러리로 연결.
