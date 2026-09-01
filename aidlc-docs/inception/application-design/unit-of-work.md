# 유닛 정의 (Unit of Work)

시스템은 3개의 유닛으로 분해됩니다. 프로젝트는 Greenfield 모노레포(모놀리식 논리 모듈 조합)이며, 학습 친화 구조(NFR-6)를 위해 최상위에 유닛별 폴더를 나란히 둡니다.

## 유닛 목록

### U1. shared-core
- **성격**: 플랫폼 독립 순수 TypeScript 라이브러리 (논리 모듈)
- **책임**: CSV/Excel 파싱, 판독문 필터, 추적관찰 규칙 판별(근거·시점 추출), 과별 집계. 상태·저장·환경 의존 없음.
- **포함 컴포넌트**: FileParser, NoteFilter, SectionExtractor, FollowUpDetector, DepartmentAggregator + 공유 타입/규칙 정의
- **의존**: 없음 (임계 경로, 최우선 구현)

### U2. v1-web-serverless
- **성격**: 브라우저 정적 웹앱 (서버리스)
- **책임**: 파일 업로드 UI, shared-core 호출, 전체/과별 대시보드, 과 선택 탭, 추적관찰 표, 진행 상태 표기(localStorage 저장).
- **포함 컴포넌트**: UploadView, DashboardView, FollowUpTableView, StatusStore(localStorage, StatusRepository 구현)
- **의존**: U1(shared-core)

### U3. v2-server
- **성격**: Node.js + TypeScript 서버(계층형) + 재사용 웹 클라이언트
- **책임**: REST API(목록/집계/상태 갱신), 서버 저장소로 진행 상태 영속화·다중 사용자 공유, 이름/과 식별. V1 UI 재사용하되 저장 계층을 서버 API로 교체.
- **포함 컴포넌트**: ApiRouter, ReportService, StatusRepository(서버), WebClient(fetch 기반 StatusRepository + V1 UI 재사용)
- **의존**: U1(shared-core), U2(UI 컴포넌트 재사용)

## 코드 조직 전략 (Greenfield 모노레포)
디렉터리 구조(Q1=A), 코어 참조(Q2=A 상대경로 import):
```
<워크스페이스 루트>/
├── shared-core/
│   ├── src/            # FileParser, NoteFilter, SectionExtractor,
│   │                   # FollowUpDetector, DepartmentAggregator, types, rules
│   └── tests/
├── v1-web-serverless/
│   ├── src/            # index.html, main.ts, views/, localStorageStatusRepository.ts
│   └── tests/
├── v2-server/
│   ├── src/            # server.ts, router, ReportService, serverStatusRepository, client/
│   └── tests/
├── sample-data/
│   └── clinical_notes.csv
├── README.md           # 전체 개요 + 각 폴더 역할 + V1/V2 차이 설명
└── (루트 설정: tsconfig 등 최소 구성)
```
- 각 유닛은 자체 빌드. V1/V2는 `../shared-core/src`를 상대 경로로 import (NFR-7 코어 재사용).
- 애플리케이션 코드는 워크스페이스 루트 하위(위 구조)에 두며, aidlc-docs/에는 두지 않음.

## 구현 순서
1. **U1 shared-core** (무의존, 먼저)
2. **U2 v1-web-serverless** (코어 사용)
3. **U3 v2-server** (코어 사용 + U2 UI 재사용)
