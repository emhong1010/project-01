/**
 * ApiRouter: REST 엔드포인트 처리(내장 http). 서비스 계층 호출.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ReportService, InvalidStatusError } from './service/reportService.js';
import { MissingColumnError, EmptyFileError, parseCsv } from '../../shared-core/src/index.js';
import type { RawRecord } from '../../shared-core/src/types.js';

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(json);
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

function toUserMessage(err: unknown): string {
  if (err instanceof MissingColumnError) return `필수 열이 없습니다: ${err.missing.join(', ')}`;
  if (err instanceof EmptyFileError) return '파일에 데이터가 없습니다.';
  if (err instanceof InvalidStatusError) return err.message;
  return '요청을 처리할 수 없습니다.';
}

/**
 * @returns true 이면 API 라우트가 처리함(호출측은 정적 서빙 생략)
 */
export async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
  service: ReportService,
): Promise<boolean> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname;
  if (!path.startsWith('/api/')) return false;

  try {
    // POST /api/process  { csv: string } | { records: RawRecord[] }
    if (path === '/api/process' && req.method === 'POST') {
      const body = await readBody(req);
      const parsed = body ? JSON.parse(body) : {};
      let records: RawRecord[];
      if (typeof parsed.csv === 'string') {
        records = parseCsv(parsed.csv);
      } else if (Array.isArray(parsed.records)) {
        records = parsed.records as RawRecord[];
      } else {
        sendJson(res, 400, { error: 'csv 텍스트 또는 records 배열이 필요합니다.' });
        return true;
      }
      const result = await service.processUpload(records);
      sendJson(res, 200, result);
      return true;
    }

    // GET /api/status
    if (path === '/api/status' && req.method === 'GET') {
      sendJson(res, 200, await service.getStatusMap());
      return true;
    }

    // GET /api/summary
    if (path === '/api/summary' && req.method === 'GET') {
      sendJson(res, 200, await service.getSummary());
      return true;
    }

    // PUT /api/status/:noteId  { status, user }
    if (path.startsWith('/api/status/') && req.method === 'PUT') {
      const noteId = decodeURIComponent(path.slice('/api/status/'.length));
      const body = await readBody(req);
      const parsed = body ? JSON.parse(body) : {};
      await service.updateStatus(noteId, parsed.status, parsed.user);
      sendJson(res, 200, { ok: true });
      return true;
    }

    sendJson(res, 404, { error: 'API 경로를 찾을 수 없습니다.' });
    return true;
  } catch (err) {
    const status = err instanceof InvalidStatusError ? 400
      : err instanceof MissingColumnError || err instanceof EmptyFileError ? 400
      : 500;
    sendJson(res, status, { error: toUserMessage(err) });
    return true;
  }
}
