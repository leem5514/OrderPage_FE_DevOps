# Jenkins 검증 후 Vercel 정적 배포

2026-11-08 KST. Vue 앱 기능/알고리즘 변경 없이 배포 계약과 검증을 추가했다. 실제 Vercel 배포/DNS 변경은 하지 않았다.

## 동작

FE main → Jenkins Node 22 테스트/lint → 운영 API 환경변수 검사 → production build → Build Output API v3 정적 패키지 → Vercel CLI --prebuilt --prod.
전체 Jenkins/계정/도메인/복구 절차는 [Infra 진행서](https://github.com/leem5514/OrderPage_Infra_DevOps/blob/codex/frontend-vercel/docs/restart/frontend-vercel.md)에 기록한다. 관련 PR 병합 후 main 경로를 기준으로 한다.

- vercel.json의 git.deploymentEnabled=false: Git push와 Jenkins가 중복 배포하지 않게 한다.
- .nvmrc=22. CI는 기존 EC2의 Node 22 agent를 사용한다.
- build:production은 VUE_APP_API_BASIC_URL이 HTTPS auctionbid.shop 하위 도메인 origin인지 검사한다. 경로/포트/인증정보/localhost는 거부한다.
- VUE_APP_*는 브라우저 코드에 공개되므로 API URL 외 키는 거부한다. CI checkout에 .env/.env.production 등 로컬 파일을 넣지 않는다.
- package:vercel은 dist를 .vercel/output/static에 복사하며 functions를 만들지 않는다. 실제 파일 우선, 누락된 자산 404, SPA index.html fallback 순서다.
- .local/build-evidence.json에 API origin/Node/UTC 시각과 파일별 hash를 남긴다. 숨김 파일과 symlink는 패키징하지 않는다.
- 기존 output은 덮어쓰지 않는다. 새 Jenkins workspace에서 생성한다. 로컬 재생성은 필요한 산출물을 보존한 뒤 해당 생성 경로만 명시적으로 정리한다.

## 로컬 검증

Node 22를 사용하고 로컬 개발용 .env 파일이 없는 깨끗한 checkout에서 실행한다.

```powershell
npm ci --no-audit --no-fund
npm test
npm run lint -- --no-fix
$env:VUE_APP_API_BASIC_URL='https://api-devops.auctionbid.shop'
npm run build:production
npm run package:vercel
```

로컬 개발은 기존 npm run serve와 .env.example을 사용한다. 일반 build 명령도 유지하며 운영 배포에서는 build:production을 사용한다.
Vercel Dashboard에서 API 값을 바꿔도 이미 빌드한 파일은 바뀌지 않는다. Jenkins 환경변수와 재빌드가 필요하다.

## 구조와 선택

Vue SPA 정적 파일은 Vercel CDN, API는 브라우저에서 서울 ALB로 직접 호출한다. Functions/SSR/API proxy를 추가하지 않았으므로 Functions 리전 설정도 넣지 않는다.
Vercel은 정적 배포·도메인·배포 이력을 플랫폼에 맡기기 위한 선택이다. S3+CloudFront보다 빠르거나 저렴하다는 실측 결과는 없다.
FE 후보 origin은 https://devops.auctionbid.shop. 실제 DNS 소유권/레코드 충돌과 BE CORS를 먼저 확인한다.

## 검증 결과

- Windows Node 22.23.4에서 기존 인증 5개 + 새 배포 4개 테스트 통과.
- lint --no-fix 및 production build, 정적 파일 12개 패키지 생성 통과.
- 기존 Browserslist/번들 크기 경고는 유지했다. 앱 의존성과 성능 코드는 수정하지 않았다.
- 실제 Vercel 업로드, CDN의 MIME/fallback, 브라우저 로그인/주문/SSE는 아직 미검증이다.

배포 뒤 /login·/product/list 새로고침, JS/CSS MIME·404, 운영 API/CORS, 상품 이미지, 인증 갱신을 확인한다.
SSE heartbeat/자동 재연결 문제는 별도 운영 검증 과제로 남아 있다.

공식 근거: [Build Output API](https://vercel.com/docs/build-output-api/configuration), [Git 배포 제어](https://vercel.com/docs/project-configuration/git-configuration), [Vue 환경변수](https://cli.vuejs.org/guide/mode-and-env.html).
