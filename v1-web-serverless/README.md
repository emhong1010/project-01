# v1-web-serverless

판독문 추적관찰 도구의 **V1 (서버리스)** 입니다. 브라우저에서만 동작하며 진행 상태는 localStorage에 저장됩니다. 서버가 필요 없어 정적 호스팅으로 배포할 수 있습니다.

## 역할
- 판독문 CSV/Excel 업로드 → `shared-core`로 판별/집계 → 진료과별 대시보드 + 표
- 각 건의 진행 상태(대기/진행중/완료)를 표기, localStorage에 저장

## 폴더 구조
```
v1-web-serverless/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.ts                       # 앱 진입/오케스트레이션
│   ├── styles.css
│   ├── localStorageStatusRepository.ts  # StatusRepository 구현(localStorage)
│   ├── xlsxAdapter.ts                # Excel → RawRecord (SheetJS)
│   └── views/
│       ├── uploadView.ts             # 업로드 + 오류 안내
│       ├── summaryDashboard.ts       # 전체 요약 + 과별 건수 + 과 탭
│       └── followUpTable.ts          # 추적관찰 필요 건 표(상태 변경/원문 토글)
└── tests/
```

## shared-core 재사용
`../shared-core/src`를 상대경로로 import 합니다(NFR-7). Excel 파싱만 xlsxAdapter에서 처리하고 나머지 판별/집계는 코어의 순수 함수 사용.

## 실행
```bash
npm install
npm run dev       # 개발 서버
npm run build     # 정적 빌드(dist/) → 정적 호스팅 배포
npm test          # 단위 테스트
npm run typecheck
```

## 사용법
1. 개발/프리뷰 서버를 열고
2. 판독문 CSV/Excel(예: `../sample-data/clinical_notes.csv`)을 업로드
3. 상단 요약·과별 건수 확인, 과 탭으로 전환
4. 표에서 각 건의 진행 상태를 변경(자동 저장), "펼치기"로 원문 확인
