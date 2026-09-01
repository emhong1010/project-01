import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detect, detectMany } from '../src/followUpDetector.js';
import type { Report } from '../src/types.js';

function makeReport(text: string, over: Partial<Report> = {}): Report {
  return {
    noteId: 'N1',
    noteType: '판독문',
    noteDate: '2025-01-01',
    dept: '호흡기내과',
    modality: 'CT',
    bodyPart: '흉부',
    authorRole: '영상의학과 판독의',
    text,
    ...over,
  };
}

test('권고형: 결론에 "추가 검사 권고" → 필요, category 권고형', () => {
  const r = detect(makeReport('[소견] r/o edema.\n[결론] 추가 검사 권고.'));
  assert.equal(r.isFollowUpNeeded, true);
  assert.equal(r.category, '권고형');
  assert.ok(r.matchedKeywords.includes('추가 검사 권고'));
  assert.ok(r.evidenceSentences.length > 0);
});

test('권고형: 소견에 "추적 검사를 권고" → 필요', () => {
  const r = detect(
    makeReport('[소견] 결절 가능성 배제할 수 없어 추적 검사를 권고합니다.\n[결론] 추가 검사 권고.'),
  );
  assert.equal(r.isFollowUpNeeded, true);
  assert.equal(r.category, '권고형');
});

test('판단형: "임상 소견과 함께 판단이 필요" → 필요, category 판단형 (Q1=B)', () => {
  const r = detect(
    makeReport('[소견] 간 우엽에 14mm nodule이 관찰됩니다.\n[결론] 임상 소견과 함께 판단이 필요합니다.'),
  );
  assert.equal(r.isFollowUpNeeded, true);
  assert.equal(r.category, '판단형');
});

test('필요 아님: "특이 소견 없습니다"', () => {
  const r = detect(makeReport('[소견] fx 소견 없음.\n[결론] 특이 소견 없습니다.'));
  assert.equal(r.isFollowUpNeeded, false);
  assert.equal(r.category, null);
});

test('오탐 방지: [임상정보]의 "추적 검사"는 판별 대상 아님', () => {
  const r = detect(
    makeReport('[임상정보] 추적 검사\n[소견] 협착 소견 없음.\n[결론] 특이 소견 없습니다.'),
  );
  assert.equal(r.isFollowUpNeeded, false);
});

test('부정 표현 제외: "추가 검사 필요 없음"', () => {
  const r = detect(makeReport('[소견] 정상.\n[결론] 추가 검사 필요 없음.'));
  assert.equal(r.isFollowUpNeeded, false);
});

test('detectMany: 배열 처리', () => {
  const results = detectMany([
    makeReport('[결론] 추가 검사 권고.'),
    makeReport('[결론] 특이 소견 없습니다.'),
  ]);
  assert.equal(results.filter((r) => r.isFollowUpNeeded).length, 1);
});
