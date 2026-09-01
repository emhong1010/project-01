import { defineConfig } from 'vite';

// shared-core를 상대경로로 import 하므로 별도 alias 불필요.
// 정적 배포를 위해 상대 경로 base 사용.
export default defineConfig({
  base: './',
  server: { open: true },
  build: { outDir: 'dist' },
});
