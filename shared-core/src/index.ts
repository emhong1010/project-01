/**
 * shared-core 공개 API.
 * V1(브라우저), V2(서버)가 이 모듈을 import 하여 동일한 로직을 재사용한다(NFR-7).
 */
export * from './types.js';
export * from './rules.js';
export {
  parseCsv,
  parseCsvRows,
  parseXlsx,
  toReports,
  MissingColumnError,
  EmptyFileError,
} from './fileParser.js';
export type { XlsxToRecords } from './fileParser.js';
export { filterReports } from './noteFilter.js';
export type { FilterResult } from './noteFilter.js';
export { extractSections } from './sectionExtractor.js';
export { detect, detectMany } from './followUpDetector.js';
export { aggregateByDept, overallSummary, ALL_STATUSES } from './departmentAggregator.js';

// 편의: 원시 레코드 → 판별 결과까지 한 번에 처리하는 헬퍼
import type { RawRecord } from './types.js';
import { toReports } from './fileParser.js';
import { filterReports } from './noteFilter.js';
import { detectMany } from './followUpDetector.js';
import { aggregateByDept, overallSummary } from './departmentAggregator.js';
import type { StatusEntry } from './types.js';

export interface ProcessResult {
  results: ReturnType<typeof detectMany>;
  summary: ReturnType<typeof overallSummary>;
  byDept: ReturnType<typeof aggregateByDept>;
}

/**
 * RawRecord[] → 판별/집계 결과 전체를 한 번에 계산하는 오케스트레이션 헬퍼.
 * (파일 읽기/Excel 변환은 호출측에서 수행한 뒤 RawRecord[]를 넘김)
 */
export function processRecords(
  records: RawRecord[],
  statuses?: Record<string, StatusEntry>,
): ProcessResult {
  const reports = toReports(records);
  const { reports: filtered, excludedCount } = filterReports(reports);
  const results = detectMany(filtered);
  return {
    results,
    summary: overallSummary(results, excludedCount),
    byDept: aggregateByDept(results, statuses),
  };
}
