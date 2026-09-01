# 도메인 엔티티 — shared-core

## Report (판독문 레코드)
| 필드 | 타입 | 원본 열 | 설명 |
|---|---|---|---|
| noteId | string | note_id | 레코드 식별자 |
| noteType | string | note_type | 기록 종류 ("판독문"만 분석) |
| noteDate | string | note_date | 작성일 YYYY-MM-DD |
| dept | string | dept | 진료과(과별 그룹 기준) |
| modality | string | modality | 검사 종류(CT/MR/CR) |
| bodyPart | string | body_part | 검사 부위 |
| authorRole | string | author_role | 작성자 역할 |
| text | string | text | 원문(섹션 구조 포함) |

## ReportSections (섹션 분리 결과)
| 필드 | 타입 | 설명 |
|---|---|---|
| exam | string | `[검사]` 내용 |
| clinicalInfo | string | `[임상정보]` 내용 (판별에서 제외) |
| findings | string | `[소견]` 내용 (판별 대상) |
| conclusion | string | `[결론]` 내용 (판별 대상) |

## DetectionResult (판별 결과)
| 필드 | 타입 | 설명 |
|---|---|---|
| report | Report | 원본 레코드 |
| isFollowUpNeeded | boolean | 추적 관찰 필요 여부 |
| category | "권고형" \| "판단형" \| null | 판별 유형(근거 라벨). 필요 아님이면 null |
| matchedKeywords | string[] | 매칭된 키워드/표현 |
| evidenceSentences | string[] | 근거 문장(소견/결론에서 추출) |
| followUpTiming | string \| null | 추적 시점/기간(있을 때만) |

> **category 라벨** (Q1=B 반영): 명시적 권고("추가 검사 권고/추적 검사를 권고/재검이 필요/추가 평가 권고")는 `권고형`, "임상 소견과 함께 판단이 필요합니다"는 `판단형`. 둘 다 isFollowUpNeeded=true. UI에서 유형을 구분 표시해 사용자가 성격을 알 수 있게 함.

## FollowUpStatus (진행 상태)
- 값: `"대기" | "진행중" | "완료"` (기본값 "대기")

## StatusEntry
| 필드 | 타입 | 설명 |
|---|---|---|
| status | FollowUpStatus | 진행 상태 |
| updatedBy | string? | (V2) 변경한 사람 이름/과 |
| updatedAt | string? | (V2) 변경 시각 |

## DepartmentSummary (과별 집계)
| 필드 | 타입 | 설명 |
|---|---|---|
| dept | string | 진료과 |
| followUpCount | number | 추적 관찰 필요 건수 |
| statusCounts | { 대기, 진행중, 완료 }? | (선택) 상태별 건수 |

## OverallSummary
| 필드 | 타입 | 설명 |
|---|---|---|
| totalReports | number | 판독문 총 건수 |
| totalFollowUp | number | 추적 관찰 필요 총 건수 |
| excludedCount | number | 판독문 아님으로 제외된 건수 |
