# 코드 생성 계획 — U2 v1-web-serverless

**위치**: `v1-web-serverless/` (워크스페이스 루트)
**기술**: TypeScript + Vite (바닐라 DOM). shared-core 상대경로 import. xlsx는 SheetJS로 RawRecord 변환하여 코어에 주입.
**담당 스토리**: US-OP-1~3, US-DOC-1~6, US-MGR-1~2, US-LRN-1

## 단계 (체크리스트)
- [x] Step 1. 구조/설정: package.json(vite), tsconfig.json, index.html, vite.config.ts
- [x] Step 2. 저장소 어댑터: src/localStorageStatusRepository.ts
- [x] Step 3. Excel 변환 어댑터: src/xlsxAdapter.ts
- [x] Step 4. UI 뷰: uploadView/summaryDashboard/followUpTable
- [x] Step 5. 앱 진입/오케스트레이션: src/main.ts, styles.css
- [x] Step 6. 단위 테스트: 5/5 통과
- [x] Step 7. 문서: README + summary.md
- [x] Step 8. 빌드 검증: vite build 성공, 프리뷰 200 확인

## 비고
- 상태 접근은 StatusRepository 계약으로 추상화(V2 재사용).
- data-testid 부여(자동화 친화).
