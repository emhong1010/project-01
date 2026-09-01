# 판독문 추적 관찰 도구

영상의학 **판독문**에서 "추적 관찰이 필요한 건"을 규칙 기반으로 찾아, **진료과별 대시보드와 표**로 보여주고 각 건의 **진행 상태(대기/진행중/완료)**를 표기하는 도구입니다.
학습·설명 목적을 겸해 폴더 구조를 한눈에 보이도록 구성했고, 두 가지 버전으로 제공합니다.

## 폴더 구조 (한눈에 보기)
```
project_01/
├── shared-core/          # [공통 코어] 파싱·판독문 필터·추적관찰 판별·과별 집계 (순수 로직)
├── v1-web-serverless/    # [V1] 브라우저 웹앱 + localStorage (서버 없음, 정적 배포)
├── v2-server/            # [V2] Node+TS 서버 + JSON 저장 (다중 사용자 공유) + V1 UI 재사용
├── sample-data/          # 예시 판독문 CSV (clinical_notes.csv)
└── aidlc-docs/           # AI-DLC 산출물(요구사항/스토리/설계/계획/감사 로그)
```

## 두 버전의 차이
| | V1 (서버리스) | V2 (서버) |
|---|---|---|
| 실행 | 브라우저만 | Node 서버 + 브라우저 |
| 진행 상태 저장 | 브라우저 localStorage | 서버 JSON 파일(공유) |
| 다중 사용자 | 개인/단일 브라우저 | 여러 과 선생님 공유 |
| 배포 | 정적 호스팅 | 서버 실행 |
| 공통 | shared-core 판별 로직 + 동일 UI 재사용 | |

핵심 판별/화면 로직은 `shared-core`와 V1 UI를 두 버전이 **공유**합니다(규칙 불일치 방지).

## 추적 관찰 판별 규칙 (요약)
- `[소견]`+`[결론]`에서 판별 (오탐 방지 위해 `[임상정보]`의 "추적 검사"는 제외)
- **권고형**: "추가 검사 권고 / 추적 검사를 권고 / 재검이 필요 / 추가 평가 권고"
- **판단형**: "임상 소견과 함께 판단이 필요"
- 규칙은 `shared-core/src/rules.ts` 한 곳에서 수정

## 빠른 시작

### V1 (서버리스)
```bash
cd v1-web-serverless
npm install
npm run dev     # 브라우저에서 sample-data/clinical_notes.csv 업로드
```

### V2 (서버)
```bash
cd v2-server
npm install
npm run build:client
npm start       # http://localhost:3000 접속 → 이름/과 입력 → CSV 업로드
```

## 테스트
```bash
cd shared-core && npm test          # 18
cd v1-web-serverless && npm test    # 5
cd v2-server && npm test            # 6
```

## 참고
- 규칙 기반이라 오탐/미탐이 있을 수 있어 근거 문장을 함께 표시합니다.
- 판독문에는 민감 정보가 포함될 수 있습니다. 프로토타입 범위로 별도 보안/마스킹은 적용하지 않았으며, 실운영 전 보안 검토가 필요합니다.
- 개발 과정 문서는 `aidlc-docs/`(AI-DLC 워크플로우 산출물)에 있습니다.
