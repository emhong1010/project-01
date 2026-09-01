# shared-core

판독문에서 "추적 관찰이 필요한 건"을 규칙 기반으로 판별하는 **플랫폼 독립 공통 코어**입니다.
V1(브라우저 웹앱)과 V2(Node 서버)가 이 코어를 그대로 재사용합니다.

## 역할
- CSV/Excel(주입형) 파싱 → 판독문 필터 → 추적관찰 판별 → 과별 집계
- 파일 I/O·저장·네트워크가 전혀 없는 **순수 로직**. 오류는 예외로 표현.

## 폴더 구조
```
shared-core/
├── src/
│   ├── types.ts             # 도메인 타입 + StatusRepository 계약
│   ├── rules.ts             # 판별 규칙(키워드/패턴) - 여기만 고치면 규칙 변경
│   ├── fileParser.ts        # CSV 파서(RFC4180) + 열 검증 + Excel 주입 인터페이스
│   ├── noteFilter.ts        # note_type == "판독문" 필터
│   ├── sectionExtractor.ts  # [검사]/[임상정보]/[소견]/[결론] 분리
│   ├── followUpDetector.ts  # 추적관찰 판별(권고형/판단형, 오탐 방지, 근거/시점)
│   ├── departmentAggregator.ts # 과별/전체 집계
│   └── index.ts             # 공개 API + processRecords 헬퍼
└── tests/                   # node:test 단위 테스트 + 실데이터 스모크
```

## 판별 규칙 요약 (rules.ts)
- **권고형**: "추가 검사 권고 / 추적 검사를 권고 / 재검이 필요 / 추가 평가 권고" 등
- **판단형**: "임상 소견과 함께 판단이 필요"
- **판별 대상**: `[소견]` + `[결론]` 만 (`[임상정보]`의 "추적 검사"는 제외 → 오탐 방지)
- **부정 제외**: "추가 검사 필요 없음" 등

## 사용 예
```ts
import { parseCsv, processRecords } from './src/index.js';
const records = parseCsv(csvText);
const { results, summary, byDept } = processRecords(records);
// results: 판별 결과, summary: 전체 요약, byDept: 과별 집계
```

## 테스트
```bash
npm install
npm test         # 단위 테스트
npm run typecheck
npx tsx tests/smoke-realdata.ts   # sample-data로 실데이터 확인
```
