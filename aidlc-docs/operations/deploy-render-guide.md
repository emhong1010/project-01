# V2 서버 무료 배포 가이드 (Render)

대상: `v2-server` (Node + TS). 플랫폼: **Render 무료 웹 서비스**.
이 가이드는 사용자님의 Render/GitHub 계정으로 직접 진행합니다(에이전트가 대신 로그인/생성 불가).

## 사전 준비 (코드 측 — 이미 완료됨)
- `v2-server/package.json`: `start` = `tsx src/server.ts`, `postinstall`에서 클라이언트 자동 빌드, tsx/vite가 dependencies에 포함.
- `src/server.ts`: `process.env.PORT` 사용 + `0.0.0.0` 바인딩 (Render 호환).
- 저장소 루트 `render.yaml`: 무료 웹 서비스 정의(rootDir=v2-server).
- `.gitignore`: node_modules/dist/public/data 제외.
- 검증 완료: 프로덕션 방식(NODE_ENV=production) 설치 후 서버 기동·정적·API 응답 200 확인.

## 방법 A: Blueprint(render.yaml) — 권장
1. 이 프로젝트를 GitHub 저장소에 푸시합니다.
   ```bash
   cd "<프로젝트 루트>"
   git init            # 이미 git이면 생략
   git add .
   git commit -m "판독문 추적관찰 도구: V2 배포 설정 추가"
   git branch -M main
   git remote add origin https://github.com/<사용자>/<저장소>.git
   git push -u origin main
   ```
2. https://dashboard.render.com 접속 → 회원가입/로그인(무료, 카드 불필요).
3. **New +** → **Blueprint** 선택 → 방금 푸시한 GitHub 저장소 연결.
4. Render가 루트의 `render.yaml`을 인식 → 서비스 `pandokmun-followup-v2` 확인 후 **Apply**.
5. 빌드 로그에서 `npm install`(→ postinstall이 vite build) → `npm start` 순으로 진행되는지 확인.
6. 배포 완료 후 발급된 URL(`https://<서비스명>.onrender.com`) 접속.

## 방법 B: 대시보드 수동 설정 (render.yaml 없이)
1. GitHub 푸시(위 1번).
2. **New +** → **Web Service** → 저장소 선택.
3. 설정:
   - **Root Directory**: `v2-server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. **Create Web Service** → 배포 대기 → URL 접속.

## 사용 확인
1. 발급된 URL 접속 → 이름/진료과 입력 후 "시작".
2. **가상 예시 데이터** `sample-data/clinical_notes.csv`를 업로드(로컬 파일에서 선택).
3. 과별 대시보드·표 확인, 진행 상태 변경 확인.

## 무료 티어 주의사항
- **슬립**: 15분간 요청이 없으면 서비스가 잠들고, 다음 접속 시 ~1분 콜드 스타트. (데모엔 무방)
- **파일 비영속**: 무료엔 영속 디스크가 없어 재배포/재시작 시 `data/status.json`(진행 상태)이 초기화됩니다. 지속 공유가 필요하면 무료 외부 DB(예: Upstash Redis, Neon Postgres) 연동으로 `StatusRepository`를 교체해야 합니다. 저장 방식이 Repository 계층에 격리돼 있어 어댑터 1개 추가로 확장 가능합니다.
- **월 750 인스턴스 시간** 제공.

## 보안 주의 (중요)
- 공개 URL은 인증이 없어 누구나 접근합니다. **반드시 가상 예시 데이터로만** 사용하세요.
- 실제 환자 판독문(민감 정보/PII)은 공개 배포에 부적합합니다. 실운영은 접근 제어·보안 검토·영속 저장을 갖춘 별도 환경에서 진행하세요.

## 참고 출처 (요약, 라이선스 준수를 위해 재구성)
- Render 무료 웹 서비스는 15분 미사용 시 스핀다운되고 다음 요청에 다시 기동됨. 무료엔 영속 디스크가 없어 재시작 시 로컬 파일 변경분이 사라짐. (render.com/free, render.com/docs/disks)
