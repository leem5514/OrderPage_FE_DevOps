# OrderPage FE DevOps

Vue 기반 주문 페이지 프론트엔드입니다.

2026-11-06 새 기준의 변경·검증은 [배포 점검 기록](docs/deployment-readiness.md)을 참고하세요.

프론트엔드는 Vercel을 사용합니다. Jenkins에서 테스트와 정적 빌드를 마친 뒤 같은 산출물을 Vercel CLI로 배포하도록 구성했습니다. Git 자동 배포는 비활성화했습니다. 실제 프로젝트 연결과 업로드는 아직 실행하지 않았습니다.

현재 설정과 실행 순서는 [Jenkins/Vercel 배포 기록](docs/vercel-deployment.md)을 참고하세요. 핵심 비교 실험은 EKS의 배포와 운영 관측입니다.

## Tech Stack

- Vue 3
- Vue Router
- Vuex
- Vuetify
- Axios
- Vercel

## Local Development

```bash
nvm use 22
npm ci
npm run serve
```

기본 개발 서버 포트는 `8081`입니다.

## Build

```bash
npm run lint
npm run build
```

## Environment Variables

`.env.example`을 참고해 로컬에서는 `.env` 또는 `.env.local`을 생성합니다.

운영 CI에서는 Infra의 공개 설정을 Jenkins 환경변수로 주입합니다. 아래 주소는 아직 DNS/API 연결을 검증하지 않은 예정값입니다. 빌드 시 JS에 포함되므로 변경 후 다시 빌드해야 합니다. 토큰 등 비밀값은 VUE_APP_*에 넣지 않습니다.

```text
VUE_APP_API_BASIC_URL=https://api-devops.auctionbid.shop
```

## Vercel Deployment

Jenkins는 깨끗한 main checkout에서 `npm ci` → `npm test` → lint → `npm run build:production` → `npm run package:vercel`을 실행합니다. 운영 빌드는 로컬 `.env*` 파일을 허용하지 않습니다. 일반 로컬 개발은 기존 `.env` 방식을 유지합니다.

배포가 활성화되면 Infra의 고정 CLI가 `.vercel/output`을 `--prebuilt --prod`로 업로드합니다. Dashboard 환경변수만 바꿔도 이미 빌드된 파일이 바뀌지는 않습니다. Functions/API 프록시는 사용하지 않고 브라우저가 API에 직접 요청합니다.

CI 시작/종료, 파일별 크기/hash, 운영 배포/검증 시각을 기록합니다. Preview 자동 배포는 이번 범위에 포함하지 않았으며, 실제 배포 시간과 복구 시간은 계정 연결 후 측정합니다.
