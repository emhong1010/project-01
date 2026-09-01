/**
 * FileStatusRepository: 진행 상태를 JSON 파일에 저장(다중 사용자 공유).
 * shared-core의 StatusRepository 계약을 구현(비동기).
 * 쓰기는 순차 처리(간단한 프라미스 체인)로 파일 경합을 완화.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  StatusRepository,
  StatusEntry,
  FollowUpStatus,
} from '../../../shared-core/src/types.js';

export class FileStatusRepository implements StatusRepository {
  private writeChain: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  private async readAll(): Promise<Record<string, StatusEntry>> {
    if (!existsSync(this.filePath)) return {};
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as Record<string, StatusEntry>;
    } catch {
      return {};
    }
  }

  private async persist(map: Record<string, StatusEntry>): Promise<void> {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(this.filePath, JSON.stringify(map, null, 2), 'utf8');
  }

  async getStatus(noteId: string): Promise<FollowUpStatus | undefined> {
    return (await this.readAll())[noteId]?.status;
  }

  async setStatus(
    noteId: string,
    status: FollowUpStatus,
    meta?: { updatedBy?: string },
  ): Promise<void> {
    // 순차 쓰기: 이전 쓰기 완료 후 read-modify-write
    this.writeChain = this.writeChain.then(async () => {
      const map = await this.readAll();
      map[noteId] = {
        status,
        updatedBy: meta?.updatedBy,
        updatedAt: new Date().toISOString(),
      };
      await this.persist(map);
    });
    return this.writeChain;
  }

  async getAll(): Promise<Record<string, StatusEntry>> {
    return this.readAll();
  }
}
