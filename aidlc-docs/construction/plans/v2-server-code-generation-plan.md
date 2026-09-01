# 코드 생성 계획 — U3 v2-server

**위치**: `v2-server/`
**기술**: Node.js + TypeScript(ESM), 프레임워크 없이 내장 http 사용(의존 최소·학습 친화). 저장: JSON 파일. 클라이언트: V1 UI 재사용 + ServerStatusRepository(fetch).
**담당 스토리**: US-DOC-7, US-MGR-3, (재사용) 공통

## 단계
- [x] Step 1. 구조/설정: package.json, tsconfig.json, vite.config.ts
- [x] Step 2. 저장소: fileStatusRepository.ts (JSON, 순차 쓰기)
- [x] Step 3. 서비스: reportService.ts
- [x] Step 4. 라우터/서버: router.ts, server.ts (내장 http)
- [x] Step 5. 재사용 클라이언트: client/(V1 뷰 재사용 + serverStatusRepository fetch + 이름/과 입력)
- [x] Step 6. 단위 테스트: 6/6 통과
- [x] Step 7. 문서: README + summary.md
- [x] Step 8. 검증: typecheck/테스트/빌드/서버 API 스모크 모두 통과

## 비고
- 판별/집계는 shared-core 재사용(NFR-7).
- 클라이언트는 V1 뷰 모듈을 상대경로로 재사용(중복 방지, Q4=B). 저장 어댑터만 fetch로 교체.
