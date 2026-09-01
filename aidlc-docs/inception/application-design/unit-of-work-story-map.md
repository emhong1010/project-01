# 스토리 ↔ 유닛 매핑 (Story Map)

## U1. shared-core (공통 코어 로직)
스토리의 "판별/파싱/집계" 로직 부분을 담당. (UI/저장은 U2/U3)
| 스토리 | 코어에서 담당하는 부분 |
|---|---|
| US-OP-1 파일 업로드 | 파싱 로직(FileParser) — 따옴표/멀티라인 처리 |
| US-OP-2 판독문 필터 | NoteFilter |
| US-OP-3 형식 오류 안내 | 파싱/열 검증(오류 신호 반환) |
| US-DOC-1 추적관찰 판별 | FollowUpDetector + SectionExtractor(오탐 방지) |
| US-DOC-2 근거 확인 | FollowUpDetector 근거 추출 |
| US-DOC-3 시점/검사 메타 | FollowUpDetector 시점 추출 |
| US-MGR-1 전체 요약 | DepartmentAggregator.overallSummary |
| US-MGR-2 과별 건수 | DepartmentAggregator.aggregateByDept |
| US-LRN-2 규칙 집중화 | FollowUpDetector 규칙 정의 파일 |
| US-LRN-3 V1/V2 코어 재사용 | 코어의 플랫폼 독립 설계 |

## U2. v1-web-serverless (브라우저 UI + localStorage)
| 스토리 | 담당 |
|---|---|
| US-OP-1/2/3 | UploadView(코어 호출 + 오류 표시) |
| US-DOC-1~5 | DashboardView/FollowUpTableView 렌더링, 원문 펼치기, 과 탭(US-DOC-4) |
| US-DOC-6 진행 상태(localStorage) | StatusStore(localStorage) + 표 상태 변경 UI |
| US-MGR-1/2 | 대시보드 표시 |
| US-LRN-1 폴더 구조 | 프로젝트 구조 + README |
| US-LRN-3 | V1이 shared-core를 상대경로로 사용 |

## U3. v2-server (서버 + 재사용 클라이언트)
| 스토리 | 담당 |
|---|---|
| US-DOC-7 진행 상태(서버 공유) | ApiRouter + ReportService + StatusRepository(서버), updatedBy 기록 |
| US-MGR-3 과별 진행 취합 | ReportService.getSummary + DepartmentAggregator 상태별 집계 |
| (재사용) US-OP-1~3, US-DOC-1~6, US-MGR-1/2 | V1 UI/코어 재사용, 저장 계층만 서버 API로 교체(Q4=B). 접속 시 이름/과 선택(FR-V2-2) |

## 커버리지 확인
- 전체 16개 스토리(US-OP-1~3, US-DOC-1~7, US-MGR-1~3, US-LRN-1~3) 모두 유닛에 배정됨.
- [공통] 스토리 → U1 로직 + U2 UI(그리고 U3가 재사용)
- [V1] US-DOC-6 → U2
- [V2] US-DOC-7, US-MGR-3 → U3
