/**
 * V1 앱 진입점: 업로드 → shared-core 판별/집계 → 대시보드/표 렌더 → 상태 변경(localStorage).
 */
import './styles.css';
import type {
  DetectionResult,
  OverallSummary,
  DepartmentSummary,
  FollowUpStatus,
  StatusEntry,
} from '../../shared-core/src/types.js';
import { renderUploadView, type LoadedPayload } from './views/uploadView.js';
import { renderSummaryDashboard, ALL_DEPTS } from './views/summaryDashboard.js';
import { renderFollowUpTable } from './views/followUpTable.js';
import { aggregateByDept, overallSummary } from '../../shared-core/src/index.js';
import { LocalStorageStatusRepository } from './localStorageStatusRepository.js';

interface AppState {
  results: DetectionResult[];
  summary: OverallSummary;
  byDept: DepartmentSummary[];
  selectedDept: string;
}

const repo = new LocalStorageStatusRepository();

const state: AppState = {
  results: [],
  summary: { totalReports: 0, totalFollowUp: 0, excludedCount: 0 },
  byDept: [],
  selectedDept: ALL_DEPTS,
};

const uploadEl = document.getElementById('upload-section')!;
const dashboardEl = document.getElementById('dashboard-section')!;
const tableEl = document.getElementById('table-section')!;

function currentStatuses(): Record<string, StatusEntry> {
  return repo.getAll() as Record<string, StatusEntry>;
}

function visibleResults(): DetectionResult[] {
  return state.results.filter(
    (r) =>
      r.isFollowUpNeeded &&
      (state.selectedDept === ALL_DEPTS || r.report.dept === state.selectedDept),
  );
}

function renderDashboardAndTable(): void {
  renderSummaryDashboard(dashboardEl, {
    summary: state.summary,
    byDept: state.byDept,
    selectedDept: state.selectedDept,
    onSelectDept: (dept) => {
      state.selectedDept = dept;
      renderDashboardAndTable();
    },
  });
  renderFollowUpTable(tableEl, {
    results: visibleResults(),
    statuses: currentStatuses(),
    onStatusChange: (noteId, status: FollowUpStatus) => {
      repo.setStatus(noteId, status);
      // 상태 변경 후 과별 집계(상태 카운트 포함) 재계산
      state.byDept = aggregateByDept(state.results, currentStatuses());
      renderDashboardAndTable();
    },
  });
}

function onLoaded(payload: LoadedPayload): void {
  state.results = payload.results;
  state.summary = payload.summary;
  state.byDept = aggregateByDept(state.results, currentStatuses());
  state.selectedDept = ALL_DEPTS;
  renderDashboardAndTable();
}

function onError(_msg: string): void {
  // 오류 시 결과 초기화
  state.results = [];
  state.summary = overallSummary([], 0);
  state.byDept = [];
  dashboardEl.innerHTML = '';
  tableEl.innerHTML = '';
}

renderUploadView(uploadEl, {
  onLoaded,
  onError,
  getStatuses: currentStatuses,
});
