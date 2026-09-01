import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, toReports, MissingColumnError, EmptyFileError } from '../src/fileParser.js';

test('parseCsv: 기본 헤더/행 파싱', () => {
  const csv = 'a,b\n1,2\n3,4\n';
  const recs = parseCsv(csv);
  assert.equal(recs.length, 2);
  assert.deepEqual(recs[0], { a: '1', b: '2' });
});

test('parseCsv: 따옴표 내 쉼표와 줄바꿈 처리', () => {
  const csv = 'note_id,text\nN1,"[소견] a, b\n[결론] 추가 검사 권고."\n';
  const recs = parseCsv(csv);
  assert.equal(recs.length, 1);
  assert.match(recs[0].text, /\[소견\] a, b/);
  assert.match(recs[0].text, /\[결론\] 추가 검사 권고/);
});

test('parseCsv: 이스케이프된 따옴표 처리', () => {
  const csv = 'x\n"he said ""hi"""\n';
  const recs = parseCsv(csv);
  assert.equal(recs[0].x, 'he said "hi"');
});

test('toReports: 필수 열 누락 시 예외', () => {
  const recs = [{ note_id: 'N1', dept: '내과' }]; // note_type, text 없음
  assert.throws(() => toReports(recs), MissingColumnError);
});

test('toReports: 빈 데이터 예외', () => {
  assert.throws(() => toReports([]), EmptyFileError);
});

test('toReports: note_id 없으면 row-N 대체', () => {
  const recs = [{ note_type: '판독문', dept: '내과', text: 't' }];
  const reports = toReports(recs);
  assert.equal(reports[0].noteId, 'row-1');
});
