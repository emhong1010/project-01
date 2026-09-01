# 비즈니스 규칙 — U3 v2-server

## R1 상태 갱신 (PUT /api/status/:noteId)
- body: { status: "대기"|"진행중"|"완료", user: string }
- status가 허용 값이 아니면 400.
- user(이름/과)가 비어도 저장은 허용하되 updatedBy는 빈 값(FR-V2-2는 로그인 없는 경량 식별).
- 저장 시 updatedAt=현재 ISO 시각 기록. 이후 GET에서 반영.

## R2 상태 공유 (US-DOC-7)
- 상태는 서버 파일에 저장되어 모든 사용자가 GET으로 동일 최신 상태 조회.
- 마지막 저장 우선(last-write-wins). 소규모/저빈도 전제.

## R3 과별 진행 취합 (US-MGR-3)
- getSummary: shared-core aggregateByDept(results, statusMap)로 과별 followUpCount + statusCounts(대기/진행중/완료) 반환.

## R4 처리/오류
- /api/process: 파싱/열 검증 실패 시 400 + 한국어 메시지(코어 예외 → 매핑).
- 파일/텍스트 둘 다 없으면 400.

## R5 코어 재사용
- 판별/집계는 shared-core 함수만 사용(V1과 동일 결과 보장, NFR-7).

## R6 정적 클라이언트 제공
- 서버는 `/`에서 재사용 클라이언트(정적 파일)를 서빙.
