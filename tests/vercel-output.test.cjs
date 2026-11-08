const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { checkProductionEnv } = require('../scripts/check-production-env.cjs');
const { packageOutput, inventory, outputConfig } = require('../scripts/package-vercel.cjs');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, '.local'), { recursive: true });
const env = { VUE_APP_API_BASIC_URL: 'https://api-devops.auctionbid.shop' };
function fixture() {
  const dir = fs.mkdtempSync(path.join(root, '.local/vercel-test-'));
  fs.mkdirSync(path.join(dir, 'dist/js'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'dist/index.html'), '<script src="/js/app.123.js"></script>');
  fs.writeFileSync(path.join(dir, 'dist/js/app.123.js'), 'const api=' + JSON.stringify(env.VUE_APP_API_BASIC_URL));
  return dir;
}
test('운영 URL 누락/HTTP/타 도메인/비밀용 VUE_APP 변수를 차단', () => {
  const dir = fixture();
  assert.equal(checkProductionEnv(env, dir), env.VUE_APP_API_BASIC_URL);
  for (const value of ['', 'http://localhost:8080', 'https://other.example', env.VUE_APP_API_BASIC_URL + '/api', 'https://user:pass@api-devops.auctionbid.shop']) {
    assert.throws(() => checkProductionEnv({ VUE_APP_API_BASIC_URL: value }, dir));
  }
  assert.throws(() => checkProductionEnv({ ...env, VUE_APP_TOKEN: 'fake' }, dir));
  fs.writeFileSync(path.join(dir, '.env.production'), 'UNREVIEWED=yes');
  assert.throws(() => checkProductionEnv(env, dir));
});
test('검증한 dist만 동일 hash로 복사하고 functions/소스/secret은 추가하지 않음', () => {
  const dir = fixture();
  const evidence = packageOutput(dir, env);
  assert.deepEqual(inventory(path.join(dir, 'dist')), inventory(path.join(dir, '.vercel/output/static')));
  assert.equal(evidence.artifactSha256.length, 64);
  assert.deepEqual(fs.readdirSync(path.join(dir, '.vercel/output')).sort(), ['config.json', 'static']);
  assert.throws(() => packageOutput(dir, env));
});
test('잘못된 번들 API/숨김 파일은 배포 패키지를 만들기 전에 실패', () => {
  const dir = fixture();
  assert.throws(() => packageOutput(dir, { VUE_APP_API_BASIC_URL: 'https://wrong.auctionbid.shop' }));
  assert.equal(fs.existsSync(path.join(dir, '.vercel/output')), false);
  fs.writeFileSync(path.join(dir, 'dist/.env'), 'fake');
  assert.throws(() => packageOutput(dir, env));
});
test('SPA 라우트는 파일 확인 후 fallback하며 유실된 자산은 404', () => {
  assert.equal(outputConfig.routes[0].handle, 'filesystem');
  const route = pathname => outputConfig.routes.slice(1).find(rule => new RegExp('^' + rule.src + '$').test(pathname));
  assert.equal(route('/login').dest, '/index.html');
  assert.equal(route('/product/list').dest, '/index.html');
  assert.equal(route('/js/missing.js').status, 404);
  assert.ok(!JSON.stringify(outputConfig).includes('https://'));
});
