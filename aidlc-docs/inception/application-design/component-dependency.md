# 컴포넌트 의존 관계 (Component Dependency)

## 의존 매트릭스 (→ 의존함)
| 컴포넌트 | 의존 대상 |
|---|---|
| FileParser (C1) | (없음, 순수) |
| NoteFilter (C2) | Report 타입 |
| SectionExtractor (C5) | (없음) |
| FollowUpDetector (C3) | SectionExtractor(C5), 판별 규칙 정의 |
| DepartmentAggregator (C4) | DetectionResult 타입 |
| UploadView (C6) | FileParser(C1) |
| DashboardView (C7) | DepartmentAggregator 결과 |
| FollowUpTableView (C8) | DetectionResult, StatusRepository 계약 |
| StatusStore V1 (C9) | localStorage, StatusRepository 계약 |
| ApiRouter (C10) | ReportService(C11) |
| ReportService (C11) | shared-core(C1~C4), StatusRepository(C12) |
| StatusRepository V2 (C12) | 서버 저장소(JSON/경량 DB), StatusRepository 계약 |
| WebClient (C13) | UI 컴포넌트(C6~C8), fetch 기반 StatusRepository |

## 유닛 간 의존 (구현 순서 근거)
```
shared-core  (의존 없음, 먼저 구현)
    ^   ^
    |   |
 v1-web   v2-server  (둘 다 shared-core에 의존)
```
- **shared-core**: 다른 유닛에 의존하지 않음 → 임계 경로, 최우선 구현.
- **v1-web-serverless**: shared-core 사용 + localStorage 어댑터.
- **v2-server**: shared-core 사용 + 서버 저장소 어댑터 + V1 UI 재사용(Q4=B).

## 데이터 흐름 (공통 파이프라인)
```
파일(CSV/Excel)
   -> FileParser: RawRecord[] -> Report[]
   -> NoteFilter: 판독문 Report[]  (+ 제외 건수)
   -> FollowUpDetector: DetectionResult[]  (판별/근거/시점, [임상정보] 제외, 부정 제외)
   -> DepartmentAggregator: 전체 요약 + DepartmentSummary[]
   -> (상태 병합) StatusRepository: noteId별 상태
   -> UI: 대시보드 + 과 탭 + 표(상태 변경)
```

## 통신 패턴
- **V1**: 함수 호출(브라우저 내부), 상태는 localStorage 동기 접근.
- **V2**: 클라이언트 ↔ 서버는 REST(HTTP/JSON). 서버 내부는 계층 간 함수 호출. 상태는 저장소 비동기 접근.

## 결합도 관리
- UI ↔ 저장소: `StatusRepository` 인터페이스로 역전(의존성 주입) → V1/V2 교체 지점 단일화.
- UI ↔ 코어: 코어는 순수 함수라 UI가 결과 데이터만 소비(단방향).
