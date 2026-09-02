# 무료 배포 가이드 (Render) — V1 + V2 함께

저장소 루트의 `render.yaml`에 **두 서비스**가 정의되어 있습니다. Blueprint 한 번으로 함께 배포됩니다.

| 서비스 | 종류 | 이름 | 특징 |
|---|---|---|---|
| V1 | Static Site | pandokmun-followup-v1 | 서버 없음, 슬립 없음, 브라우저 localStorage 저장 |
| V2 | Web Service (Node) | pandokmun-followup-v2 | 서버+JSON 저장(공유), 무료라 15분 슬립 |

## 배포 준비 (완료된 상태)
- `render.yaml`: V1(static, `v1-web-serverless/dist` 퍼블리시) + V2(node, `cd v2-server && npm start`).
- V1: `xlsx`를 자체 dependencies로 보유, shared-core는 상대경로 소스로 번들 → 격리 빌드 성공 검증됨.
- V2: vite `resolve.alias`로 `xlsx`를 v2-server 패키지로 고정 → 격리 빌드 성공 검증됨.
- 두 서비스 모두 clean 환경(Render 재현)에서 빌드→서빙 200 확인 완료.

## 배포 절차 (Blueprint, 권장)
1. 코드가 이미 GitHub(`emhong1010/project-01`, main)에 푸시되어 있습니다.
2. https://dashboard.render.com 로그인.
3. **New +** → **Blueprint** → 저장소 `emhong1010/project-01` 선택.
4. Render가 `render.yaml`을 읽어 **서비스 2개**(V1 static, V2 web)를 보여줍니다 → **Apply**.
5. 각각 빌드 로그 확인:
   - V1: `cd v1-web-serverless && npm install && npm run build` → `dist/` 퍼블리시.
   - V2: `cd v2-server && npm install`(postinstall이 클라이언트 빌드) → `npm start`.
6. 발급 URL:
   - V1: `https://pandokmun-followup-v1.onrender.com` (또는 대시보드 표시 URL)
   - V2: `https://pandokmun-followup-v2.onrender.com`

## 사용
- **V1**: URL 접속 → `sample-data/clinical_notes.csv` 업로드 → 과별 대시보드/표, 진행 상태(브라우저 저장).
- **V2**: URL 접속 → 이름/과 입력 → 같은 CSV 업로드 → 진행 상태가 서버에 저장(공유). 첫 접속은 슬립 해제로 ~1분 걸릴 수 있음.

## 주의
- 무료 V2는 15분 미사용 시 슬립, 재시작 시 `data/status.json`(진행 상태) 초기화(무료 비영속). V1은 슬립 없음(정적).
- 공개 URL은 인증 없음 → **가상 예시 데이터로만** 사용. 실제 환자 판독문 금지.

## 개별 배포(선택)
Blueprint 대신 하나씩 만들려면:
- V1: New + → **Static Site** → Root `v1-web-serverless`, Build `npm install && npm run build`, Publish `dist`.
- V2: New + → **Web Service** → Root `v2-server`, Build `npm install`, Start `npm start`.
