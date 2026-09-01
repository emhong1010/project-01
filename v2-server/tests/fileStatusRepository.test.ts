import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync } from 'node:fs';
import { FileStatusRepository } from '../src/repository/fileStatusRepository.js';

function tmpFile(): string {
  return join(tmpdir(), `status-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

test('setStatus/getStatus 파일 저장·조회', async () => {
  const f = tmpFile();
  try {
    const repo = new FileStatusRepository(f);
    assert.equal(await repo.getStatus('N1'), undefined);
    await repo.setStatus('N1', '진행중', { updatedBy: '내과 / 김민준' });
    assert.equal(await repo.getStatus('N1'), '진행중');
    const all = await repo.getAll();
    assert.equal(all['N1'].updatedBy, '내과 / 김민준');
    assert.ok(all['N1'].updatedAt);
  } finally {
    rmSync(f, { force: true });
  }
});

test('다른 인스턴스로도 파일에서 공유 조회(다중 사용자 시뮬)', async () => {
  const f = tmpFile();
  try {
    await new FileStatusRepository(f).setStatus('A', '완료', { updatedBy: 'u1' });
    const repo2 = new FileStatusRepository(f);
    assert.equal(await repo2.getStatus('A'), '완료');
  } finally {
    rmSync(f, { force: true });
  }
});

test('연속 setStatus 순차 처리(경합 없이 모두 반영)', async () => {
  const f = tmpFile();
  try {
    const repo = new FileStatusRepository(f);
    await Promise.all([
      repo.setStatus('A', '대기'),
      repo.setStatus('B', '진행중'),
      repo.setStatus('C', '완료'),
    ]);
    const all = await repo.getAll();
    assert.equal(all['A'].status, '대기');
    assert.equal(all['B'].status, '진행중');
    assert.equal(all['C'].status, '완료');
  } finally {
    rmSync(f, { force: true });
  }
});
