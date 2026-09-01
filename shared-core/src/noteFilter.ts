/**
 * NoteFilter: 판독문만 남기고 다른 기록(간호기록/경과기록 등)을 제외.
 */
import type { Report } from './types.js';

const REPORT_NOTE_TYPE = '판독문';

export interface FilterResult {
  reports: Report[];
  excludedCount: number;
}

export function filterReports(reports: Report[]): FilterResult {
  const kept = reports.filter((r) => r.noteType.trim() === REPORT_NOTE_TYPE);
  return {
    reports: kept,
    excludedCount: reports.length - kept.length,
  };
}
