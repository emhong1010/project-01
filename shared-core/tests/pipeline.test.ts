import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterReports } from '../src/noteFilter.js';
import { toReports } from '../src/fileParser.js';
import { aggregateByDept, overallSummary } from '../src/departmentAggregator.js';
import { detectMany } from '../src/followUpDetector.js';
import { processRecords } from '../src/index.js';
import type { RawRecord } from '../src/types.js';

test('noteFilter: 판독문만 남기고 제외 건수 계산', () => {
  const reports = toReports([
    { note_type: '판독문', dept: '내과', text: '[결론] 추가 검사 권고.' },
    { note_type: '간호기록', dept: '내과', text: 't' },
    { note_type: '경과기록', dept: '내과', text: 't' },
  ]);
  const { reports: kept, excludedCount } = filterReports(reports);
  assert.equal(kept.length, 1);
  assert.equal(excludedCount, 2);
});

test('aggregateByDept: 과별 필요 건수 집계 + 정렬', () => {
  const reports = toReports([
    { note_type: '판독문', dept: '흉부외과', text: '[결론] 추가 검사 권고.' },
    { note_type: '판독문', dept: '흉부외과', text: '[결론] 재검이 필요합니다.' },
    { note_type: '판독문', dept: '신경과', text: '[결론] 추가 검사 권고.' },
    { note_type: '판독문', dept: '신경과', text: '[결론] 특이 소견 없습니다.' },
  ]);
  const results = detectMany(reports);
  const byDept = aggregateByDept(results);
  assert.equal(byDept[0].dept, '흉부외과');
  assert.equal(byDept[0].followUpCount, 2);
  const neuro = byDept.find((d) => d.dept === '신경과');
  assert.equal(neuro?.followUpCount, 1);
});

test('aggregateByDept: 상태 주어지면 상태별 건수 계산', () => {
  const reports = toReports([
    { note_id: 'A', note_type: '판독문', dept: '내과', text: '[결론] 추가 검사 권고.' },
    { note_id: 'B', note_type: '판독문', dept: '내과', text: '[결론] 재검이 필요합니다.' },
  ]);
  const results = detectMany(reports);
  const byDept = aggregateByDept(results, { A: { status: '완료' } });
  assert.equal(byDept[0].statusCounts?.완료, 1);
  assert.equal(byDept[0].statusCounts?.대기, 1); // B는 기본 대기
});

test('overallSummary: 전체/필요/제외 집계', () => {
  const reports = toReports([
    { note_type: '판독문', dept: '내과', text: '[결론] 추가 검사 권고.' },
    { note_type: '판독문', dept: '내과', text: '[결론] 특이 소견 없습니다.' },
  ]);
  const results = detectMany(reports);
  const s = overallSummary(results, 5);
  assert.equal(s.totalReports, 2);
  assert.equal(s.totalFollowUp, 1);
  assert.equal(s.excludedCount, 5);
});

test('processRecords: end-to-end 헬퍼', () => {
  const recs: RawRecord[] = [
    { note_id: 'N1', note_type: '판독문', dept: '내과', text: '[결론] 추가 검사 권고.' },
    { note_id: 'N2', note_type: '간호기록', dept: '내과', text: 't' },
  ];
  const out = processRecords(recs);
  assert.equal(out.summary.totalReports, 1);
  assert.equal(out.summary.totalFollowUp, 1);
  assert.equal(out.summary.excludedCount, 1);
  assert.equal(out.byDept[0].dept, '내과');
});
