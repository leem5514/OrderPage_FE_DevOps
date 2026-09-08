# OrderPage FE DevOps

Vue 기반 주문 페이지 프론트엔드입니다.

프론트엔드 배포는 S3 + CloudFront 대신 Vercel을 사용합니다. 이 프로젝트의 핵심 DevOps 실험은 EKS, Jenkins, Terraform, RDS, Redis, RabbitMQ, Prometheus/Grafana 기반 백엔드 운영에 두고, 프론트엔드는 Vercel의 Git 연동 배포와 Preview Deployment를 활용해 빠르게 검증합니다.

## Tech Stack

- Vue 3
- Vue Router
- Vuex
- Vuetify
- Axios
- Vercel

## Local Development

```bash
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

Vercel에서는 Project Settings > Environment Variables에서 환경별로 설정합니다.

```text
VUE_APP_API_BASIC_URL=https://your-backend-api.example.com
```

## Vercel Deployment

권장 설정:

- Framework Preset: Vue.js
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Production Branch: `main`

측정할 지표:

- Pull Request 생성 후 Preview URL 생성 시간
- `main` merge 후 Production 반영 시간
- 이전 deployment rollback 시간
- JS/CSS bundle size
