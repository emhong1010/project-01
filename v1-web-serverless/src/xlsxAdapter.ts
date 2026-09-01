/**
 * xlsxAdapter: Excel(.xlsx) 바이트 → RawRecord[] 변환.
 * shared-core는 순수 로직이므로 Excel 파싱은 이 어댑터가 담당(주입형).
 */
import * as XLSX from 'xlsx';
import type { RawRecord } from '../../shared-core/src/types.js';

export function xlsxToRecords(bytes: ArrayBuffer | Uint8Array): RawRecord[] {
  const wb = XLSX.read(bytes, { type: 'array' });
  const firstSheet = wb.SheetNames[0];
  if (!firstSheet) return [];
  const sheet = wb.Sheets[firstSheet];
  // 헤더 기반 객체 배열. 모든 값을 문자열로.
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });
  return rows.map((row) => {
    const rec: RawRecord = {};
    for (const [k, v] of Object.entries(row)) {
      rec[String(k).trim()] = v == null ? '' : String(v);
    }
    return rec;
  });
}
