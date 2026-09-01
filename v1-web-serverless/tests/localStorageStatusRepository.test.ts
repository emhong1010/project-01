import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageStatusRepository, MemoryStore } from '../src/localStorageStatusRepository.js';

test('setStatus/getStatus 저장·조회', () => {
  const repo = new LocalStorageStatusRepository(new MemoryStore());
  assert.equal(repo.getStatus('N1'), undefined);
  repo.setStatus('N1', '진행중');
  assert.equal(repo.getStatus('N1'), '진행중');
});

test('setStatus는 updatedAt 기록', () => {
  const repo = new LocalStorageStatusRepository(new MemoryStore());
  repo.setStatus('N1', '완료');
  const all = repo.getAll();
  assert.equal(all['N1'].status, '완료');
  assert.ok(all['N1'].updatedAt);
});

test('여러 noteId 독립 저장', () => {
  const repo = new LocalStorageStatusRepository(new MemoryStore());
  repo.setStatus('A', '대기');
  repo.setStatus('B', '완료');
  assert.equal(repo.getStatus('A'), '대기');
  assert.equal(repo.getStatus('B'), '완료');
});

test('동일 저장소 재생성 시 데이터 유지(맵 공유)', () => {
  const store = new MemoryStore();
  new LocalStorageStatusRepository(store).setStatus('N1', '진행중');
  const repo2 = new LocalStorageStatusRepository(store);
  assert.equal(repo2.getStatus('N1'), '진행중');
});

test('손상된 JSON은 빈 맵으로 복구', () => {
  const store = new MemoryStore();
  store.setItem('followup-status', '{broken');
  const repo = new LocalStorageStatusRepository(store);
  assert.deepEqual(repo.getAll(), {});
});
