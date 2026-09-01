/**
 * V2 HTTP 서버: /api/* 는 라우터, 그 외는 정적 클라이언트(public/) 서빙.
 * 프레임워크 없이 Node 내장 http 사용(학습 친화, 의존 최소).
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './router.js';
import { ReportService } from './service/reportService.js';
import { FileStatusRepository } from './repository/fileStatusRepository.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT, 'public');
const DATA_FILE = join(ROOT, 'data', 'status.json');
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

const repo = new FileStatusRepository(DATA_FILE);
const service = new ReportService(repo);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

async function serveStatic(pathname: string, res: import('node:http').ServerResponse): Promise<void> {
  let rel = pathname === '/' ? '/index.html' : pathname;
  // 경로 탈출 방지
  const safe = normalize(rel).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(PUBLIC_DIR, safe);
  if (!filePath.startsWith(PUBLIC_DIR) || !existsSync(filePath)) {
    // SPA 폴백: index.html
    const indexPath = join(PUBLIC_DIR, 'index.html');
    if (existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(await readFile(indexPath));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('클라이언트가 빌드되지 않았습니다. `npm run build:client`를 실행하세요.');
    return;
  }
  const type = MIME[extname(filePath)] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  res.end(await readFile(filePath));
}

const server = createServer(async (req, res) => {
  try {
    const handled = await handleApi(req, res, service);
    if (handled) return;
    const url = new URL(req.url ?? '/', 'http://localhost');
    await serveStatic(url.pathname, res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: '서버 오류' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`V2 서버 실행 중: http://${HOST}:${PORT}`);
});

export { server };
