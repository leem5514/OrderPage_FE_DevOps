# 프론트 배포 준비 점검 — 2026-11-06

기준 원격 main: `a1218dcbe0f58e07b5c4f5bc87ac8a85052a17a4`.
작업 브랜치: `codex/deployment-readiness`.

## Vercel과 API 경로

Vue 3/Vue CLI SPA다. npm ci → npm run build → dist로 배포하며 vercel.json의 index.html rewrite는 history route 새로고침용이다. 서버 함수/API 프록시는 없다.

VUE_APP_API_BASIC_URL은 빌드 시 JavaScript에 포함되는 공개 값이다. 서버 비밀번호나 AWS 키를 넣지 않는다. 이번에는 https://api-devops.auctionbid.shop 후보값으로 빌드해 번들 반영을 확인했으며, DNS/API 연결 성공을 뜻하지 않는다.

Jenkins에서 빌드하면 이 값도 Jenkins 빌드 단계에 주입해야 한다. Vercel Dashboard만 변경한 뒤 기존 dist를 올리면 URL이 바뀌지 않는다. CLI 배포 절차는 다음 CI 단계에서 고정한다.

브라우저가 서울 API에 직접 요청한다. Vercel 정적 CDN과 Functions 실행 리전은 다른 개념이며 이 SPA에 Functions 리전 설정을 추가하지 않았다.

## 수정한 실제 오류

기존 main.js는 모든 401에 대해 같은 Axios 인스턴스로 refresh API를 호출했다. refresh도 401이면 같은 인터셉터가 재진입해 반복 호출할 수 있었다.

auth-interceptors.js로 인터셉터를 옮기고 갱신에는 별도 Axios 인스턴스를 쓴다. RT가 없거나 갱신에 실패하면 로그아웃하고, 동시에 발생한 401은 한 갱신을 공유한다. 로그인/500 오류는 갱신하지 않는다. 성공 시 기존 새로고침을 유지하고 주문 POST는 자동 재전송하지 않는다.

## 검증

Windows Node 20.16.0 / npm 10.8.1. Jenkins/Vercel의 지원 런타임은 CI 단계에서 고정한다.

```powershell
npm ci --no-audit --no-fund
npm test
npm run lint -- --no-fix
$env:VUE_APP_API_BASIC_URL='https://api-devops.auctionbid.shop'
npm run build
```

- 수정 전/후 production build와 lint 성공.
- 인증 테스트 5개 성공: RT 만료, RT 없음, 성공 시 주문 재전송 없음, 동시 401, 로그인/서버 오류 제외.
- 번들에 후보 API URL 포함 확인.
- 오래된 Browserslist 데이터 및 3개 번들 용량 경고는 기록만 했다. 성능 개선/의존성 일괄 업그레이드는 하지 않았다.
- adapter로 요청 흐름을 검증했으며 실제 브라우저·Vercel·BE 왕복 검증은 아니다.

## 배포 후 확인

- /login, /product/list 직접 접속과 새로고침, JS/CSS MIME 및 404 처리.
- 운영 API host/HTTPS, preflight CORS, 가입/로그인/토큰 만료, 상품 이미지 읽기.
- HeaderComponent는 SSE 오류 시 close하며 자동 재연결을 보장하지 않는다. ALB idle timeout/Pod 교체 후 재접속을 검증하고 HTTP 성공률만으로 SSE 무중단을 주장하지 않는다. 필요한 복구 변경은 배포 실험 준비 단계에서 처리한다.
- 실제 Vercel 배포 및 기존 도메인 연결 변경은 하지 않았다.
