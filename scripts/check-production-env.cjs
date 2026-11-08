const fs = require('node:fs');
const path = require('node:path');

function checkProductionEnv(env = process.env, root = path.resolve(__dirname, '..')) {
  const value = env.VUE_APP_API_BASIC_URL;
  if (typeof value !== 'string' || !/^https:\/\/[a-z0-9-]+\.auctionbid\.shop$/.test(value)) {
    throw new Error('운영 API는 경로/포트/인증정보 없는 HTTPS auctionbid.shop 하위 도메인이어야 합니다.');
  }
  const unexpected = Object.keys(env).filter(key => key.startsWith('VUE_APP_') && key !== 'VUE_APP_API_BASIC_URL');
  if (unexpected.length) throw new Error('허용되지 않은 VUE_APP_* 환경변수입니다. 클라이언트 변수에 비밀값을 넣지 마세요.');
  // Vue CLI가 추가 환경 파일을 읽어 숨은 설정을 섞지 않도록 CI는 깨끗한 checkout을 사용한다.
  for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    if (fs.existsSync(path.join(root, name))) throw new Error(name + ' 대신 CI 환경변수로 운영 값을 주입하세요.');
  }
  return value;
}
module.exports = { checkProductionEnv };
if (require.main === module) {
  try { checkProductionEnv(); console.log('운영 API 환경변수 확인 완료'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
