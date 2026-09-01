/**
 * ReportService: shared-core 오케스트레이션 + 저장소 조합(계층형의 서비스 계층).
 */
import {
  toReports,
  filterReports,
  detectMany,
  aggregateByDept,
  overallSummary,
} from '../../../shared-core/src/index.js';
import type {
  RawRecord,
  DetectionResult,
  DepartmentSummary,
  OverallSummary,
  FollowUpStatus,
  StatusEntry,
} from '../../../shared-core/src/types.js';
import type { StatusRepository } from '../../../shared-core/src/types.js';

const ALLOWED_STATUSES: FollowUpStatus[] = ['대기', '진행중', '완료'];

export interface ProcessResponse {
  results: DetectionResult[];
  summary: OverallSummary;
  byDept: DepartmentSummary[];
}

export class ReportService {
  // 프로토타입: 최근 업로드된 판별 결과를 메모리에 보관(진행 상태는 저장소에 영속)
  private lastResults: DetectionResult[] = [];

  constructor(private readonly repo: StatusRepository) {}

  async processUpload(records: RawRecord[]): Promise<ProcessResponse> {
    const reports = toReports(records); // 열 검증 실패 시 예외 → 라우터가 400 처리
    const { reports: filtered, excludedCount } = filterReports(reports);
    const results = detectMany(filtered);
    this.lastResults = results;
    const statuses = (await this.repo.getAll()) as Record<string, StatusEntry>;
    return {
      results,
      summary: overallSummary(results, excludedCount),
      byDept: aggregateByDept(results, statuses),
    };
  }

  async updateStatus(noteId: string, status: string, user?: string): Promise<void> {
    if (!ALLOWED_STATUSES.includes(status as FollowUpStatus)) {
      throw new InvalidStatusError(status);
    }
    await this.repo.setStatus(noteId, status as FollowUpStatus, { updatedBy: user });
  }

  async getStatusMap(): Promise<Record<string, StatusEntry>> {
    return (await this.repo.getAll()) as Record<string, StatusEntry>;
  }

  async getSummary(): Promise<DepartmentSummary[]> {
    const statuses = (await this.repo.getAll()) as Record<string, StatusEntry>;
    return aggregateByDept(this.lastResults, statuses);
  }
}

export class InvalidStatusError extends Error {
  constructor(public readonly value: string) {
    super(`허용되지 않은 상태 값입니다: ${value}`);
    this.name = 'InvalidStatusError';
  }
}
