# 비즈니스 로직 모델 — shared-core

## 처리 파이프라인
```
원본 데이터(RawRecord[])
  └─(FileParser.toReports)→ Report[]        # 열 검증(R9), 표준 열 매핑(Q4=A)
      └─(NoteFilter.filterReports)→ 판독문 Report[] + excludedCount   # R8
          └─(FollowUpDetector.detectMany)→ DetectionResult[]          # R1~R7
              └─(DepartmentAggregator)→ OverallSummary + DepartmentSummary[]
```

## 컴포넌트별 로직

### FileParser
- `parseCsv(text)`: RFC 4180 방식 파서 사용(따옴표 내 쉼표/줄바꿈/이스케이프 `""` 처리). 헤더 행 → RawRecord[].
- `parseXlsx(bytes)`: 시트 첫 행을 헤더로, 이후 행을 RawRecord로.
- `toReports(records)`: 필수 열 검증(R9). 누락 시 `MissingColumnError`(어떤 열이 없는지 포함) throw. 표준 열 이름으로 Report 매핑. noteId 없으면 `row-{index}`.

### NoteFilter
- `filterReports(reports)`: `noteType === "판독문"`만 남김. excludedCount = 나머지 수.

### SectionExtractor
- `extractSections(text)`: 정규식으로 `[검사]`, `[임상정보]`, `[소견]`, `[결론]` 라벨 위치를 찾아 각 구간 텍스트 분리. 라벨이 없으면 해당 필드는 빈 문자열, 전체를 findings 폴백으로 처리.

### FollowUpDetector (핵심)
- `detect(report)`:
  1. sections = extractSections(report.text)
  2. target = sections.findings + "\n" + sections.conclusion  (R1)
  3. R4(부정/제외) 검사 → 해당 시 필요 아님 반환
  4. R2 권고형 매칭 검사 → 매칭 시 category="권고형"
  5. 아니면 R3 판단형 매칭 → 매칭 시 category="판단형"
  6. isFollowUpNeeded = (category != null)
  7. 근거 문장(R6), 시점(R7) 추출
  8. DetectionResult 반환
- `detectMany(reports)`: 각 report에 detect 적용.
- 규칙 표현은 별도 상수(`rules.ts`)로 분리(NFR-4).

### DepartmentAggregator
- `aggregateByDept(results, statuses?)`: dept로 그룹핑, followUpCount(=isFollowUpNeeded true 수), (statuses 있으면) statusCounts 계산.
- `overallSummary(results, excludedCount)`: totalReports, totalFollowUp, excludedCount.

## 데이터 흐름 다이어그램 (텍스트)
```
파일 → 파싱 → 판독문 필터 → [소견+결론 추출] → 규칙 판별(권고형/판단형, 부정 제외)
     → 근거/시점 → 과별 집계 → (전체/과별 요약) → 상태 병합(호출측) → UI
```

## 순수성 원칙 (Q2=A / 아키텍트 결정)
- 이 유닛의 모든 함수는 입력→출력 순수 함수. 파일 I/O, localStorage, DB, 네트워크 없음.
- 오류는 예외로 표현(Q3=A). 사용자 메시지 변환은 호출측(UI/서비스) 책임.
