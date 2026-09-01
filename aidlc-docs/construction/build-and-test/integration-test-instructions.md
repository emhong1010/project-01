# 통합 테스트 지침

## 목적
유닛 간 상호작용 검증: (1) 코어 재사용 일관성(V1 코어 vs V2 서버 결과 동일), (2) V2 클라이언트 ↔ 서버 API.

## 시나리오 1: shared-core ↔ v2-server 결과 일관성 (NFR-7)
- **설명**: 동일 CSV에 대해 코어 직접 계산과 V2 `/api/process` 결과가 같아야 함.
- **절차**:
  ```bash
  # 코어 직접
  cd shared-core && npx tsx tests/smoke-realdata.ts
  # V2 서버
  cd ../v2-server && npm run build:client && PORT=3011 npm start &
  sleep 2
  CSV=$(node -e "console.log(JSON.stringify(require('fs').readFileSync('../sample-data/clinical_notes.csv','utf8')))")
  curl -s -X POST http://localhost:3011/api/process -H "Content-Type: application/json" -d "{\"csv\": $CSV}"
  ```
- **기대 결과**: 양쪽 모두 판독문 306 / 추적관찰 필요 196 / 제외 182. (검증 완료)
- **정리**: 서버 종료, `v2-server/data/status.json` 삭제.

## 시나리오 2: v2-server API 계약 (WebClient ↔ 서버)
- **절차**(서버 실행 상태에서):
  ```bash
  # 처리
  curl -s -X POST http://localhost:3011/api/process -H "Content-Type: application/json" -d '{"csv":"note_id,note_type,dept,text\nN1,판독문,내과,[결론] 추가 검사 권고."}'
  # 상태 변경
  curl -s -X PUT http://localhost:3011/api/status/N1 -H "Content-Type: application/json" -d '{"status":"진행중","user":"내과 / 김민준"}'
  # 상태 공유 조회
  curl -s http://localhost:3011/api/status
  # 과별 취합
  curl -s http://localhost:3011/api/summary
  ```
- **기대 결과**: process는 판별/집계 JSON, status PUT은 {ok:true}, status GET은 updatedBy 포함 맵, summary는 statusCounts 포함. (검증 완료)

## 시나리오 3: 오류 경로
- 필수 열 누락 CSV → `/api/process` 400 + "필수 열이 없습니다: ..."
- 잘못된 상태 값 → `/api/status/:id` 400 + "허용되지 않은 상태 값입니다: ..."

## 정리
```bash
# 서버 프로세스 종료 후
rm -f v2-server/data/status.json
```
