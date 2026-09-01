/**
 * UploadView: CSV/Excel 파일 업로드 UI + 오류 안내.
 */
import { parseCsv, toReports, MissingColumnError, EmptyFileError } from '../../../shared-core/src/index.js';
import { filterReports } from '../../../shared-core/src/index.js';
import { detectMany, aggregateByDept, overallSummary } from '../../../shared-core/src/index.js';
import type { DetectionResult, OverallSummary, DepartmentSummary, RawRecord, StatusEntry } from '../../../shared-core/src/types.js';
import { xlsxToRecords } from '../xlsxAdapter.js';

export interface LoadedPayload {
  results: DetectionResult[];
  summary: OverallSummary;
  byDept: DepartmentSummary[];
}

export interface UploadCallbacks {
  onLoaded: (payload: LoadedPayload) => void;
  onError: (message: string) => void;
  getStatuses: () => Record<string, StatusEntry>;
}

function processRecordsWithStatuses(
  records: RawRecord[],
  statuses: Record<string, StatusEntry>,
): LoadedPayload {
  const reports = toReports(records);
  const { reports: filtered, excludedCount } = filterReports(reports);
  const results = detectMany(filtered);
  return {
    results,
    summary: overallSummary(results, excludedCount),
    byDept: aggregateByDept(results, statuses),
  };
}

function toUserMessage(err: unknown): string {
  if (err instanceof MissingColumnError) return `필수 열이 없습니다: ${err.missing.join(', ')}`;
  if (err instanceof EmptyFileError) return '파일에 데이터가 없습니다.';
  return '파일을 읽을 수 없습니다. CSV 또는 Excel(.xlsx) 형식인지 확인하세요.';
}

export function renderUploadView(container: HTMLElement, cb: UploadCallbacks): void {
  container.innerHTML = `
    <div class="upload-box">
      <label class="upload-label" for="upload-input">판독문 파일 (CSV 또는 Excel)</label>
      <input id="upload-input" data-testid="upload-input" type="file" accept=".csv,.xlsx,.xls" />
      <div id="upload-error" data-testid="upload-error" class="upload-error" hidden></div>
    </div>
  `;

  const input = container.querySelector<HTMLInputElement>('#upload-input')!;
  const errorBox = container.querySelector<HTMLDivElement>('#upload-error')!;

  const showError = (msg: string) => {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    cb.onError(msg);
  };
  const clearError = () => {
    errorBox.hidden = true;
    errorBox.textContent = '';
  };

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    clearError();
    try {
      const statuses = cb.getStatuses();
      let records: RawRecord[];
      if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        records = parseCsv(text);
      } else {
        const buf = await file.arrayBuffer();
        records = xlsxToRecords(buf);
      }
      const payload = processRecordsWithStatuses(records, statuses);
      cb.onLoaded(payload);
    } catch (err) {
      showError(toUserMessage(err));
    }
  });
}
