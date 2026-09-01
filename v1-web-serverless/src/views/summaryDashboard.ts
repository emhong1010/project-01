/**
 * SummaryDashboard: 전체 요약 + 과별 추적관찰 필요 건수 + 과 선택 탭.
 */
import type { OverallSummary, DepartmentSummary } from '../../../shared-core/src/types.js';

export const ALL_DEPTS = '전체';

export interface DashboardProps {
  summary: OverallSummary;
  byDept: DepartmentSummary[];
  selectedDept: string;
  onSelectDept: (dept: string) => void;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}

export function renderSummaryDashboard(container: HTMLElement, props: DashboardProps): void {
  const { summary, byDept, selectedDept, onSelectDept } = props;
  const maxCount = Math.max(1, ...byDept.map((d) => d.followUpCount));

  const cards = `
    <div class="summary-cards">
      <div class="card"><div class="card-num" data-testid="summary-total">${summary.totalReports}</div><div class="card-label">판독문 수</div></div>
      <div class="card card-highlight"><div class="card-num" data-testid="summary-followup">${summary.totalFollowUp}</div><div class="card-label">추적 관찰 필요</div></div>
      <div class="card"><div class="card-num">${summary.excludedCount}</div><div class="card-label">제외(비판독문)</div></div>
    </div>
  `;

  const bars = byDept
    .map(
      (d) => `
      <div class="dept-bar-row">
        <span class="dept-bar-name">${escapeHtml(d.dept)}</span>
        <span class="dept-bar-track"><span class="dept-bar-fill" style="width:${(d.followUpCount / maxCount) * 100}%"></span></span>
        <span class="dept-bar-count">${d.followUpCount}</span>
      </div>`,
    )
    .join('');

  const tabs = [ALL_DEPTS, ...byDept.map((d) => d.dept)]
    .map((dept) => {
      const active = dept === selectedDept ? 'active' : '';
      const count = dept === ALL_DEPTS ? summary.totalFollowUp : byDept.find((d) => d.dept === dept)?.followUpCount ?? 0;
      return `<button class="dept-tab ${active}" data-testid="dept-tab-${escapeHtml(dept)}" data-dept="${escapeHtml(dept)}">${escapeHtml(dept)} <span class="tab-count">${count}</span></button>`;
    })
    .join('');

  container.innerHTML = `
    ${cards}
    <h2 class="section-title">과별 추적 관찰 필요 건수</h2>
    <div class="dept-bars">${bars || '<p class="empty">데이터가 없습니다.</p>'}</div>
    <div class="dept-tabs">${tabs}</div>
  `;

  container.querySelectorAll<HTMLButtonElement>('.dept-tab').forEach((btn) => {
    btn.addEventListener('click', () => onSelectDept(btn.dataset.dept as string));
  });
}
