/**
 * ServerStatusRepository: StatusRepository를 서버 REST API로 구현(fetch).
 * V1의 LocalStorageStatusRepository 자리에 주입되어 UI 코드는 그대로 재사용(Q4=B).
 */
import type {
  StatusRepository,
  StatusEntry,
  FollowUpStatus,
} from '../../../shared-core/src/types.js';

export class ServerStatusRepository implements StatusRepository {
  private cache: Record<string, StatusEntry> = {};

  constructor(private readonly user: string) {}

  /** 초기 로드: 서버 상태를 캐시에 채움 (UI가 동기 getAll을 쓰므로 사전 로드 필요) */
  async load(): Promise<void> {
    const res = await fetch('/api/status');
    this.cache = res.ok ? await res.json() : {};
  }

  getStatus(noteId: string): FollowUpStatus | undefined {
    return this.cache[noteId]?.status;
  }

  setStatus(noteId: string, status: FollowUpStatus): void {
    // 낙관적 캐시 갱신
    this.cache[noteId] = { status, updatedBy: this.user, updatedAt: new Date().toISOString() };
    // 서버 반영(비동기, 실패는 콘솔 경고)
    void fetch(`/api/status/${encodeURIComponent(noteId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, user: this.user }),
    }).catch((e) => console.warn('상태 저장 실패:', e));
  }

  getAll(): Record<string, StatusEntry> {
    return this.cache;
  }
}
