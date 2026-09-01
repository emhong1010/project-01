/**
 * FileParser: CSV/Excel 원본을 RawRecord[] → Report[] 로 변환.
 * - 파일 I/O는 하지 않음(이미 읽힌 문자열/데이터를 입력받음) — 코어 순수성 유지.
 * - CSV는 외부 의존 없이 RFC4180 방식으로 직접 파싱(따옴표 내 쉼표/줄바꿈/이스케이프 "" 처리).
 */
import type { RawRecord, Report } from './types.js';

/** 필수 열 누락 시 발생 */
export class MissingColumnError extends Error {
  constructor(public readonly missing: string[]) {
    super(`필수 열이 없습니다: ${missing.join(', ')}`);
    this.name = 'MissingColumnError';
  }
}

/** 빈 파일/데이터 시 발생 */
export class EmptyFileError extends Error {
  constructor() {
    super('파일에 데이터가 없습니다.');
    this.name = 'EmptyFileError';
  }
}

const REQUIRED_COLUMNS = ['note_type', 'dept', 'text'];

/**
 * RFC4180 방식 CSV 파서.
 * 한 셀 안의 쉼표/줄바꿈은 따옴표로 감싸며, 따옴표 문자는 "" 로 이스케이프.
 */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;
  // BOM 제거
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (ch === '\r') {
      i++;
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  // 마지막 필드/행 반영 (파일 끝 개행 없을 수 있음)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** CSV 텍스트 → RawRecord[] (헤더 기반 매핑) */
export function parseCsv(text: string): RawRecord[] {
  const rows = parseCsvRows(text).filter(
    (r) => !(r.length === 1 && r[0].trim() === ''),
  );
  if (rows.length === 0) throw new EmptyFileError();
  const header = rows[0].map((h) => h.trim());
  const records: RawRecord[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const rec: RawRecord = {};
    header.forEach((col, idx) => {
      rec[col] = (cells[idx] ?? '').trim();
    });
    records.push(rec);
  }
  return records;
}

/**
 * Excel(.xlsx) 파싱은 코어 순수성 유지를 위해 주입형으로 둔다.
 * 소비 유닛(V1/V2)이 xlsx 라이브러리로 RawRecord[]를 만들어 toReports에 넘긴다.
 * (여기서는 시그니처만 제공)
 */
export type XlsxToRecords = (bytes: ArrayBuffer | Uint8Array) => RawRecord[];

export function parseXlsx(bytes: ArrayBuffer | Uint8Array, converter: XlsxToRecords): RawRecord[] {
  return converter(bytes);
}

/** RawRecord[] → Report[] (필수 열 검증, 표준 열 매핑) */
export function toReports(records: RawRecord[]): Report[] {
  if (records.length === 0) throw new EmptyFileError();
  const columns = Object.keys(records[0]);
  const missing = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
  if (missing.length > 0) throw new MissingColumnError(missing);

  return records.map((rec, index) => ({
    noteId: rec['note_id']?.trim() || `row-${index + 1}`,
    noteType: rec['note_type'] ?? '',
    noteDate: rec['note_date'] ?? '',
    dept: rec['dept'] ?? '',
    modality: rec['modality'] ?? '',
    bodyPart: rec['body_part'] ?? '',
    authorRole: rec['author_role'] ?? '',
    text: rec['text'] ?? '',
  }));
}
