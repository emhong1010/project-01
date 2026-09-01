import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync } from 'node:fs';
import { ReportService, InvalidStatusError } from '../src/service/reportService.js';
import { FileStatusRepository } from '../src/repository/fileStatusRepository.js';
import type { RawRecord } from '../../shared-core/src/types.js';

function makeService(): { service: ReportService; file: string } {
  const file = join(tmpdir(), `svc-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  return { service: new ReportService(new FileStatusRepository(file)), file };
}

const RECORDS: RawRecord[] = [
  { note_id: 'N1', note_type: '판독문', dept: '내과', modality: 'CT', body_part: '복부', text: '[소견] nodule.\n[결론] 추가 검사 권고.' },
  { note_id: 'N2', note_type: '판독문', dept: '내과', modality: 'CR', body_part: '흉부', text: '[결론] 특이 소견 없습니다.' },
  { note_id: 'N3', note_type: '간호기록', dept: '내과', modality: '', body_part: '', text: '기록' },
];

test('processUpload: 판별/집계 + 제외 카운트', async () => {
  const { service, file } = makeService();
  try {
    const out = await service.processUpload(RECORDS);
    assert.equal(out.summary.totalReports, 2);
    assert.equal(out.summary.totalFollowUp, 1);
    assert.equal(out.summary.excludedCount, 1);
    assert.equal(out.byDept[0].dept, '내과');
    assert.equal(out.byDept[0].followUpCount, 1);
  } finally {
    rmSync(file, { force: true });
  }
});

test('updateStatus: 허용 값 저장 + getSummary 상태 반영', async () => {
  const { service, file } = makeService();
  try {
    await service.processUpload(RECORDS);
    await service.updateStatus('N1', '완료', '내과 / 김민준');
    const summary = await service.getSummary();
    assert.equal(summary[0].statusCounts?.완료, 1);
    const map = await service.getStatusMap();
    assert.equal(map['N1'].status, '완료');
    assert.equal(map['N1'].updatedBy, '내과 / 김민준');
  } finally {
    rmSync(file, { force: true });
  }
});

test('updateStatus: 잘못된 상태 값 예외', async () => {
  const { service, file } = makeService();
  try {
    await assert.rejects(() => service.updateStatus('N1', '엉뚱', 'u'), InvalidStatusError);
  } finally {
    rmSync(file, { force: true });
  }
});
