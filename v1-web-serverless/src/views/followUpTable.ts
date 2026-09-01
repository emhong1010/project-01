/**
 * FollowUpTable: 선택 과의 추적관찰 필요 건 표.
 * 열: 식별자, 진행상태(select), 유형, 근거 문장, 추적시점, 검사종류/부위, 작성일, 원문(펼치기)
 */
import type { DetectionResult, FollowUpStatus, StatusEntry } from '../../../shared-core/src/types.js';
import { ALL_STATUSES } from '../../../shared-core/src/index.js';

export interface TableProps {
  results: DetectionResult[];       // 이미 (선택 과 & isFollowUpNeeded) 필터된 목록
  statuses: Record<string, StatusEntry>;
  onStatusChange: (noteId: string, status: FollowUpStatus) => void;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}

export function renderFollowUpTable(container: HTMLElement, props: TableProps): void {
  const { results, statuses, onStatusChange } = props;

  if (results.length === 0) {
    container.innerHTML = `<p class="empty">표시할 추적 관찰 필요 건이 없습니다.</p>`;
    return;
  }

  const rows = results
    .map((r) => {
      const noteId = r.report.noteId;
      const current = statuses[noteId]?.status ?? '대기';
      const options = ALL_STATUSES.map(
        (s) => `<option value="${s}" ${s === current ? 'selected' : ''}>${s}</option>`,
      ).join('');
      const evidence = r.evidenceSentences.map((e) => `<div class="evidence">• ${escapeHtml(e)}</div>`).join('');
      const badgeClass = r.category === '권고형' ? 'badge-rec' : 'badge-judge';
      return `
        <tr class="followup-row status-${current}" data-testid="followup-row-${escapeHtml(noteId)}">
          <td class="col-id">${escapeHtml(noteId)}</td>
          <td class="col-status">
            <select class="status-select" data-testid="status-select-${escapeHtml(noteId)}" data-note="${escapeHtml(noteId)}">${options}</select>
          </td>
          <td class="col-cat"><span class="badge ${badgeClass}">${escapeHtml(r.category ?? '')}</span></td>
          <td class="col-evidence">${evidence || '-'}</td>
          <td class="col-timing">${escapeHtml(r.followUpTiming ?? '-')}</td>
          <td class="col-exam">${escapeHtml(r.report.modality)} / ${escapeHtml(r.report.bodyPart)}</td>
          <td class="col-date">${escapeHtml(r.report.noteDate)}</td>
          <td class="col-fulltext">
            <button class="toggle-fulltext" data-testid="toggle-fulltext-${escapeHtml(noteId)}" data-note="${escapeHtml(noteId)}">펼치기</button>
            <pre class="fulltext" hidden>${escapeHtml(r.report.text)}</pre>
          </td>
        </tr>`;
    })
    .join('');

  container.innerHTML = `
    <table class="followup-table">
      <thead>
        <tr>
          <th>식별자</th><th>진행 상태</th><th>유형</th><th>판별 근거</th>
          <th>추적 시점</th><th>검사/부위</th><th>작성일</th><th>원문</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  container.querySelectorAll<HTMLSelectElement>('.status-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      onStatusChange(sel.dataset.note as string, sel.value as FollowUpStatus);
    });
  });
  container.querySelectorAll<HTMLButtonElement>('.toggle-fulltext').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pre = btn.parentElement?.querySelector<HTMLElement>('.fulltext');
      if (!pre) return;
      pre.hidden = !pre.hidden;
      btn.textContent = pre.hidden ? '펼치기' : '접기';
    });
  });
}
