# 빌드 지침 (Build Instructions)

## 사전 요구사항
- **런타임**: Node.js 18+ (권장 20+), npm
- **빌드 도구**: 유닛별 npm 스크립트 (shared-core는 빌드 불필요, V1/V2는 Vite)
- **시스템**: macOS/Linux/Windows, 인터넷(최초 의존성 설치 시)

## 유닛별 빌드 절차

### 1. shared-core (라이브러리, 빌드 산출물 없음)
```bash
cd shared-core
npm install
npm run typecheck   # 타입 검증
```
- 산출물: 없음(소스 그대로 V1/V2가 상대경로로 import).

### 2. v1-web-serverless (정적 웹앱)
```bash
cd v1-web-serverless
npm install
npm run build       # → dist/ (정적 배포 가능)
# 로컬 확인: npm run dev  또는  npm run preview
```
- 산출물: `v1-web-serverless/dist/` (index.html + assets). 정적 호스팅에 그대로 업로드 가능(FR-V1-2).

### 3. v2-server (Node 서버 + 클라이언트)
```bash
cd v2-server
npm install
npm run build:client   # → public/ (재사용 클라이언트)
npm start              # 서버 실행 (기본 PORT=3000, 변경: PORT=3010 npm start)
# 개발: npm run dev
```
- 산출물: `v2-server/public/` (클라이언트), 서버는 tsx로 직접 실행.

## 빌드 성공 확인
- shared-core: typecheck 오류 없음.
- V1: `dist/` 생성, `✓ built` 메시지.
- V2: `public/` 생성, 서버 기동 시 "V2 서버 실행 중: http://localhost:PORT".

## 문제 해결
- **의존성 오류**: 각 유닛 폴더에서 `npm install` 재실행. Node 버전 확인.
- **상대경로 import 오류**: V1/V2가 `../shared-core/src`를 참조하므로 세 폴더가 워크스페이스 루트에 함께 있어야 함.
- **포트 충돌(V2)**: `PORT=3010 npm start`로 변경.
