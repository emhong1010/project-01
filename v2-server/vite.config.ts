import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// 클라이언트(src/client)를 public/으로 빌드. 서버가 public/을 정적 서빙.
export default defineConfig({
  root: resolve(__dirname, 'src/client'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'public'),
    emptyOutDir: true,
  },
});
