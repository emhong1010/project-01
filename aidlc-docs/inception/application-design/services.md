# 서비스 정의 (Services)

## V1 (서버리스) — 서비스 없음(경량 오케스트레이션)
V1은 서버가 없으므로 별도 서비스 계층 대신, 브라우저 내 얇은 오케스트레이션 흐름을 둡니다.

### V1 처리 흐름 (AppController 개념)
1. UploadView가 파일을 읽어 바이트/텍스트 확보
2. `FileParser.parseCsv/parseXlsx` → `toReports`
3. `NoteFilter.filterReports` → 판독문만
4. `FollowUpDetector.detectMany` → 판별 결과
5. `DepartmentAggregator` → 전체/과별 요약
6. `StatusStore(localStorage)`에서 기존 상태 로드 후 결과와 병합
7. DashboardView + FollowUpTableView 렌더링
8. 상태 변경 시 StatusStore에 저장

## V2 (서버) — 계층형 (Q3=A)

### ReportService (서비스 계층)
- **책임**: 코어 로직 호출 오케스트레이션 + 저장소 조합. 라우터와 저장소 사이의 유일한 비즈니스 조합 지점.
- **오케스트레이션**:
  - `processUpload`: FileParser → NoteFilter → FollowUpDetector → DepartmentAggregator 순으로 호출(=V1과 동일 코어 재사용, NFR-7).
  - `getSummary`: 저장된 판별 결과 + StatusRepository 상태 → DepartmentAggregator로 상태별 집계.
  - `updateStatus`: 입력 검증 후 StatusRepository에 위임, `updatedBy`(이름/과) 기록.

### 서비스 상호작용 요약
```
[Client/WebClient] --HTTP--> [ApiRouter] --> [ReportService] --> [shared-core 컴포넌트들]
                                                    |
                                                    +--> [StatusRepository] --> [저장소(JSON/경량DB)]
```

## 오케스트레이션 원칙
- 코어 컴포넌트(C1~C5)는 상태를 갖지 않는 순수 로직 — V1의 컨트롤러와 V2의 ReportService가 동일하게 호출.
- 환경 의존(파일 읽기, localStorage, 서버 저장)은 서비스/어댑터 계층에만 존재(Q2=A).
- UI는 `StatusRepository` 계약에만 의존하여 V1/V2 저장소를 주입 교체(Q4=B).
