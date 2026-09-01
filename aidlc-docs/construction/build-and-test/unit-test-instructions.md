# 단위 테스트 실행 지침

각 유닛은 Node 내장 `node:test` + `tsx`로 테스트합니다.

## 실행
```bash
cd shared-core && npm test          # 18개
cd ../v1-web-serverless && npm test # 5개
cd ../v2-server && npm test         # 6개
```

## 기대 결과
- shared-core: 18 pass / 0 fail
  - 파서(따옴표/멀티라인/이스케이프), 열 검증 예외, 판별(권고형/판단형/부정/[임상정보] 제외), 필터, 과별/전체 집계
- v1-web-serverless: 5 pass / 0 fail
  - LocalStorageStatusRepository 저장/조회/복구
- v2-server: 6 pass / 0 fail
  - FileStatusRepository(저장/공유/순차쓰기), ReportService(처리/집계/상태갱신/잘못된 값 예외)

## 실패 시
1. 출력에서 실패 케이스 확인
2. 관련 소스 수정(판별 규칙은 `shared-core/src/rules.ts`)
3. 재실행
