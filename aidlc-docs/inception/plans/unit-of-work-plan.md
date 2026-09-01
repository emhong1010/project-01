# 유닛(Unit of Work) 생성 계획

**목적**: 시스템을 개발 단위(유닛)로 분해. 애플리케이션 설계에서 이미 3유닛(shared-core, v1-web-serverless, v2-server)이 도출되어 있으므로, 본 단계는 유닛 정의·의존·스토리 매핑을 확정하고 코드 조직 전략을 결정합니다.

---

## A. 유닛 산출물 체크리스트
- [ ] unit-of-work.md — 유닛 정의·책임 + 코드 조직 전략(Greenfield)
- [ ] unit-of-work-dependency.md — 유닛 의존 매트릭스
- [ ] unit-of-work-story-map.md — 스토리 ↔ 유닛 매핑
- [ ] 유닛 경계·의존 검증, 모든 스토리 배정 확인

## B. 확정 사항 (이전 단계에서 결정됨, 재질문 없음)
- 유닛 3개: **shared-core**(순수 코어), **v1-web-serverless**(브라우저+localStorage), **v2-server**(Node+TS 서버, 계층형)
- 구현 순서: shared-core → v1-web → v2-server (코어가 임계 경로)
- 배포 모델: V1 정적 호스팅, V2 단일 Node 서버 (프로토타입)
- UI: V1 UI 먼저 → V2 재사용, StatusRepository로 저장 계층 교체

---

## C. 확인 질문

## 질문 1 — 모노레포 디렉터리 구조 (학습 친화, NFR-6)
학습자가 한눈에 이해할 수 있는 폴더 구조를 어떻게 잡을까요? (워크스페이스 루트 기준)

A) 최상위에 유닛별 폴더를 나란히:
```
shared-core/       (src/, tests/)
v1-web-serverless/ (src/, tests/)
v2-server/         (src/, tests/)
sample-data/       (clinical_notes.csv)
README.md          (전체 개요 + 각 폴더 역할)
```
각 폴더가 자기설명적이고, 최상위에서 세 버전이 바로 보임.

B) `packages/` 아래에 모아두는 표준 모노레포 스타일:
```
packages/shared-core/
packages/v1-web-serverless/
packages/v2-server/
```

C) 버전 우선 그룹핑:
```
core/
web-v1/
server-v2/
```

X) 기타 (아래 [Answer]: 뒤에 설명해 주세요)

> 🤖 **소프트웨어 아키텍트 권장**: A) 최상위 유닛별 폴더 나란히
> **근거**: 각 보기 검토 — A는 저장소를 열자마자 `shared-core / v1-web-serverless / v2-server` 세 축이 최상위에 그대로 노출되어 학습자가 구조를 즉시 파악(NFR-6 "눈에 확 보이는 구조"에 가장 직접 부합)하고, 폴더명이 곧 역할. B(packages/)는 npm 워크스페이스 관례로 도구 친화적이나 한 단계 감춰져 학습자 입장에선 덜 직관적이고 모노레포 도구 설정 부담이 추가됨. C는 짧지만 "core/server-v2"가 버전/역할을 A만큼 명확히 드러내지 못함. 요구가 "학습자 설명"이므로 A가 최적.
> **숙고 포인트**: (트레이드오프) A는 표준 워크스페이스 도구(pnpm/npm workspaces) 관례와 다를 수 있어, 코어 재사용을 상대경로 import 또는 간단한 로컬 링크로 처리해야 함 — 프로토타입엔 부담 없음. / (되돌리기) 나중에 정식 패키지 배포가 필요하면 B로 이전 가능. / (다른 선택이 유리한 경우) npm 패키지 퍼블리시가 목표라면 B.
> **신뢰도**: High

[Answer]: a

## 질문 2 — shared-core 재사용 연결 방식
V1/V2가 shared-core를 코드로 어떻게 참조할까요?

A) 상대 경로 import + 각 유닛이 자체 빌드(가장 단순, 학습 친화). 코어는 TypeScript 소스로 두고 V1/V2가 직접 참조/번들

B) npm/pnpm 워크스페이스로 `@app/shared-core` 패키지 링크(표준적이나 설정 필요)

X) 기타 (아래 [Answer]: 뒤에 설명해 주세요)

> 🤖 **소프트웨어 아키텍트 권장**: A) 상대 경로 import + 유닛별 빌드
> **근거**: 각 보기 검토 — A는 워크스페이스 도구 설정 없이 코어 소스를 각 버전이 직접 참조해 학습자가 "이 파일이 저 폴더의 코어를 쓴다"를 눈으로 따라가기 쉬움(NFR-6, NFR-7). B는 규모가 커지면 이상적이나 워크스페이스/링크/빌드 파이프라인 설정이 프로토타입·학습 목적엔 진입장벽. Q1=A(최상위 폴더)와도 일관.
> **숙고 포인트**: (트레이드오프) A는 코어 변경 시 각 유닛이 재빌드 필요(소규모라 무해). / (되돌리기) 후에 B로 승격 가능. / (먼저 확인) 브라우저 번들러가 상대경로 TS import를 처리하는지(간단한 번들러/네이티브 ESM로 충족 가능).
> **신뢰도**: Medium

[Answer]: a
