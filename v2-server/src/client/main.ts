/**
 * V2 클라이언트 진입점.
 * V1의 UI 뷰(uploadView/summaryDashboard/followUpTable)와 스타일을 그대로 재사용하고(Q4=B),
 * 저장 계층만 ServerStatusRepository(fetch)로 교체한다.
 */
import '../../../v1-web-serverless/src/styles.css';
import type {
  DetectionResult,
  OverallSummary,
  DepartmentSummary,
  FollowUpStatus,
  StatusEntry,
} from '../../../shared-core/src/types.js';
import { aggregateByDept, overallSummary } from '../../../shared-core/src/index.js';
import { renderUploadView, type LoadedPayload } from '../../../v1-web-serverless/src/views/uploadView.js';
import { renderSummaryDashboard, ALL_DEPTS } from '../../../v1-web-serverless/src/views/summaryDashboard.js';
import { renderFollowUpTable } from '../../../v1-web-serverless/src/views/followUpTable.js';
import { ServerStatusRepository } from './serverStatusRepository.js';

interface AppState {
  results: DetectionResult[];
  summary: OverallSummary;
  byDept: DepartmentSummary[];
  selectedDept: string;
}

const state: AppState = {
  results: [],
  summary: { totalReports: 0, totalFollowUp: 0, excludedCount: 0 },
  byDept: [],
  selectedDept: ALL_DEPTS,
};

let repo: ServerStatusRepository | null = null;

const uploadEl = document.getElementById('upload-section')!;
const dashboardEl = document.getElementById('dashboard-section')!;
const tableEl = document.getElementById('table-section')!;

function currentStatuses(): Record<string, StatusEntry> {
  return repo ? repo.getAll() : {};
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
      repo?.setStatus(noteId, status);
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

function onError(): void {
  state.results = [];
  state.summary = overallSummary([], 0);
  state.byDept = [];
  dashboardEl.innerHTML = '';
  tableEl.innerHTML = '';
}

function startApp(user: string): void {
  repo = new ServerStatusRepository(user);
  repo.load().then(() => {
    renderUploadView(uploadEl, { onLoaded, onError, getStatuses: currentStatuses });
  });
}

// 이름/과 입력 → 시작 (로그인 없음, FR-V2-2)
const nameInput = document.getElementById('user-name') as HTMLInputElement;
const deptInput = document.getElementById('user-dept') as HTMLInputElement;
const enterBtn = document.getElementById('user-enter') as HTMLButtonElement;
const currentSpan = document.getElementById('user-current')!;

enterBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const dept = deptInput.value.trim();
  const user = [dept, name].filter(Boolean).join(' / ') || '익명';
  currentSpan.textContent = `사용자: ${user}`;
  startApp(user);
});
