/**
 * shared-core 공용 타입 정의
 * 판독문 파싱 → 필터 → 추적관찰 판별 → 과별 집계에 사용되는 도메인 타입.
 */

/** 파싱된 원시 행 (열 이름 → 값) */
export type RawRecord = Record<string, string>;

/** 판독문 레코드 (표준 열 매핑 결과) */
export interface Report {
  noteId: string;
  noteType: string;
  noteDate: string;
  dept: string;
  modality: string;
  bodyPart: string;
  authorRole: string;
  text: string;
}

/** 본문 섹션 분리 결과 */
export interface ReportSections {
  exam: string;          // [검사]
  clinicalInfo: string;  // [임상정보] - 판별 제외
  findings: string;      // [소견] - 판별 대상
  conclusion: string;    // [결론] - 판별 대상
}

/** 판별 유형 라벨 */
export type FollowUpCategory = '권고형' | '판단형';

/** 추적관찰 판별 결과 */
export interface DetectionResult {
  report: Report;
  isFollowUpNeeded: boolean;
  category: FollowUpCategory | null;
  matchedKeywords: string[];
  evidenceSentences: string[];
  followUpTiming: string | null;
}

/** 진행 상태 값 */
export type FollowUpStatus = '대기' | '진행중' | '완료';

/** 기본 진행 상태 */
export const DEFAULT_STATUS: FollowUpStatus = '대기';

/** 저장된 상태 항목 */
export interface StatusEntry {
  status: FollowUpStatus;
  updatedBy?: string;
  updatedAt?: string;
}

/** 과별 집계 */
export interface DepartmentSummary {
  dept: string;
  followUpCount: number;
  statusCounts?: Record<FollowUpStatus, number>;
}

/** 전체 요약 */
export interface OverallSummary {
  totalReports: number;
  totalFollowUp: number;
  excludedCount: number;
}

/**
 * 진행 상태 저장소 계약.
 * V1(localStorage), V2(서버 API)가 각각 구현. UI는 이 인터페이스에만 의존.
 * 동기(V1)/비동기(V2) 모두 허용하기 위해 반환 타입에 Promise를 허용.
 */
export interface StatusRepository {
  getStatus(noteId: string): FollowUpStatus | undefined | Promise<FollowUpStatus | undefined>;
  setStatus(
    noteId: string,
    status: FollowUpStatus,
    meta?: { updatedBy?: string },
  ): void | Promise<void>;
  getAll(): Record<string, StatusEntry> | Promise<Record<string, StatusEntry>>;
}
