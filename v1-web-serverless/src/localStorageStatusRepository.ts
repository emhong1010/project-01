/**
 * LocalStorageStatusRepository: 진행 상태를 브라우저 localStorage에 저장.
 * shared-core의 StatusRepository 계약을 구현 → V2에서 이 자리에 서버 어댑터를 주입(UI 불변).
 *
 * 저장 형태(Q2=A): 단일 키에 { noteId: {status, updatedAt} } 맵.
 */
import type {
  StatusRepository,
  StatusEntry,
  FollowUpStatus,
} from '../../shared-core/src/types.js';

const STORAGE_KEY = 'followup-status';

/** localStorage 접근을 추상화(테스트 시 주입 가능) */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class LocalStorageStatusRepository implements StatusRepository {
  private store: KeyValueStore;

  constructor(store?: KeyValueStore) {
    // 브라우저면 window.localStorage, 아니면 주입값(테스트용)
    this.store =
      store ??
      (typeof localStorage !== 'undefined'
        ? localStorage
        : new MemoryStore());
  }

  private readAll(): Record<string, StatusEntry> {
    const raw = this.store.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, StatusEntry>;
    } catch {
      return {};
    }
  }

  private writeAll(map: Record<string, StatusEntry>): void {
    this.store.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  getStatus(noteId: string): FollowUpStatus | undefined {
    return this.readAll()[noteId]?.status;
  }

  setStatus(noteId: string, status: FollowUpStatus, meta?: { updatedBy?: string }): void {
    const map = this.readAll();
    map[noteId] = {
      status,
      updatedBy: meta?.updatedBy,
      updatedAt: new Date().toISOString(),
    };
    this.writeAll(map);
  }

  getAll(): Record<string, StatusEntry> {
    return this.readAll();
  }
}

/** 테스트/비브라우저 환경용 인메모리 저장소 */
export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}
