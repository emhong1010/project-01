/**
 * DepartmentAggregator: 판별 결과를 진료과(dept)별로 집계 + 전체 요약.
 */
import type {
  DetectionResult,
  DepartmentSummary,
  OverallSummary,
  StatusEntry,
  FollowUpStatus,
} from './types.js';
import { DEFAULT_STATUS } from './types.js';

const ALL_STATUSES: FollowUpStatus[] = ['대기', '진행중', '완료'];

function emptyStatusCounts(): Record<FollowUpStatus, number> {
  return { 대기: 0, 진행중: 0, 완료: 0 };
}

/**
 * 과별 추적관찰 필요 건수 집계.
 * statuses가 주어지면 상태별 건수도 계산.
 */
export function aggregateByDept(
  results: DetectionResult[],
  statuses?: Record<string, StatusEntry>,
): DepartmentSummary[] {
  const map = new Map<string, DepartmentSummary>();

  for (const r of results) {
    if (!r.isFollowUpNeeded) continue;
    const dept = r.report.dept || '(미지정)';
    let summary = map.get(dept);
    if (!summary) {
      summary = { dept, followUpCount: 0 };
      if (statuses) summary.statusCounts = emptyStatusCounts();
      map.set(dept, summary);
    }
    summary.followUpCount++;
    if (statuses && summary.statusCounts) {
      const status = statuses[r.report.noteId]?.status ?? DEFAULT_STATUS;
      summary.statusCounts[status]++;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.followUpCount - a.followUpCount);
}

/** 전체 요약 */
export function overallSummary(
  results: DetectionResult[],
  excludedCount = 0,
): OverallSummary {
  return {
    totalReports: results.length,
    totalFollowUp: results.filter((r) => r.isFollowUpNeeded).length,
    excludedCount,
  };
}

export { ALL_STATUSES };
