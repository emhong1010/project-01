# UI 동작 규칙 — U2 v1-web-serverless

## R1 진행 상태 전이
- 상태 값: 대기/진행중/완료. 임의 값으로 자유 변경 가능(강제 순서 없음). 기본값 대기.
- 상태 변경 시 즉시 localStorage 저장(updatedAt 기록), 대시보드 상태별/건수 즉시 반영.

## R2 필터/표시
- 표에는 `isFollowUpNeeded === true`인 건만 표시.
- selectedDept가 '전체'가 아니면 해당 과만 표시.
- 유형(category) 배지: 권고형/판단형 구분 표시.

## R3 오류 처리 (FR-12)
- MissingColumnError → "필수 열이 없습니다: {열}" 안내.
- EmptyFileError → "파일에 데이터가 없습니다." 안내.
- 파싱 예외 → "파일을 읽을 수 없습니다. CSV/Excel 형식을 확인하세요." 안내.
- 오류 시 이전 결과는 유지하지 않고 초기화(혼동 방지) 또는 오류만 표시.

## R4 원문 표시
- 근거 문장(evidenceSentences)은 상시 표시.
- 원문(report.text)은 기본 접힘, "펼치기"로 전체 표시(Q3=A).

## R5 localStorage (Q2=A)
- 단일 키 `followup-status`에 noteId 기준 맵 저장. 새로고침 후 복원.
