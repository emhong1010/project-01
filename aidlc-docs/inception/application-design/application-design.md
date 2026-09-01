# 애플리케이션 설계 (통합본)

## 설계 결정 요약
| 항목 | 결정 |
|---|---|
| 코어 컴포넌트 분해 (Q1) | A) 기능별 분리 (FileParser/NoteFilter/FollowUpDetector/DepartmentAggregator + SectionExtractor) |
| 코어 재사용 형태 (Q2) | A) 플랫폼 독립 순수 로직 모듈 (환경 의존은 코어 밖) |
| V2 서버 스타일 (Q3) | A) 계층형 (라우터 → 서비스 → 저장소) |
| UI 공유 (Q4) | B) V1 UI 먼저 → V2가 재사용, 저장 계층만 교체 |

## 아키텍처 개요
3개 유닛으로 구성된 모노레포. 학습자가 폴더명만으로 역할을 파악할 수 있도록 구성(NFR-6).
```
shared-core/           # 순수 TypeScript 로직 (파싱/필터/판별/집계)
v1-web-serverless/     # 브라우저 UI + localStorage (정적 배포)
v2-server/             # Node.js+TS 서버(계층형) + 재사용 클라이언트
```

## 컴포넌트 (요약)
- **shared-core**: FileParser(C1), NoteFilter(C2), FollowUpDetector(C3), DepartmentAggregator(C4), SectionExtractor(C5)
- **v1-web**: UploadView(C6), DashboardView(C7), FollowUpTableView(C8), StatusStore/localStorage(C9)
- **v2-server**: ApiRouter(C10), ReportService(C11), StatusRepository/서버(C12), WebClient(C13)
- **공유 계약**: `StatusRepository` (V1/V2 저장소 교체 지점)

상세: `components.md`, `component-methods.md` 참조.

## 서비스/오케스트레이션
- V1: 브라우저 내 얇은 컨트롤러가 코어 파이프라인 순차 호출 + localStorage 병합.
- V2: `ReportService`가 동일 코어를 호출(재사용, NFR-7)하고 `StatusRepository`로 상태 영속화.

상세: `services.md` 참조.

## 의존 관계 / 데이터 흐름
- shared-core는 무의존(임계 경로). v1/v2가 코어에 의존.
- 파이프라인: 파일 → 파싱 → 판독문 필터 → 추적관찰 판별(근거/시점, [임상정보] 제외) → 과별 집계 → 상태 병합 → UI.

상세: `component-dependency.md` 참조.

## 핵심 설계 원칙
1. **규칙 집중화(NFR-4)**: 판별 키워드/패턴은 FollowUpDetector의 규칙 정의 한 곳.
2. **오탐 방지**: SectionExtractor로 `[소견]/[결론]`만 판별 대상, `[임상정보]`·부정 표현 제외.
3. **코어 재사용(NFR-7)**: 순수 로직을 V1/V2가 동일 소스로 사용.
4. **교체 가능한 저장소**: UI는 `StatusRepository` 계약에만 의존.
5. **학습 친화(NFR-6)**: 자기설명적 폴더/컴포넌트 명명.

## 다음 단계
유닛 생성(Units Generation)에서 위 3유닛을 정식 유닛으로 정의하고 의존/스토리 매핑을 확정합니다.
