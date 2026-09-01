import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';

// 클라이언트(src/client)를 public/으로 빌드. 서버가 public/을 정적 서빙.
// 클라이언트가 재사용하는 v1-web-serverless/src/xlsxAdapter.ts 가 'xlsx'를 import 하는데,
// 배포 환경에서는 v2-server만 설치되므로 v2-server의 node_modules에 있는 xlsx로 해석되도록 alias 지정.
const require = createRequire(import.meta.url);
const xlsxEntry = require.resolve('xlsx');

export default defineConfig({
  root: resolve(__dirname, 'src/client'),
  base: './',
  resolve: {
    alias: {
      // 'xlsx' 및 하위 경로 import를 v2-server가 설치한 패키지로 고정
      xlsx: xlsxEntry,
    },
  },
  build: {
    outDir: resolve(__dirname, 'public'),
    emptyOutDir: true,
  },
});
