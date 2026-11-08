const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { checkProductionEnv } = require('./check-production-env.cjs');

// Build Output API v3: 정적 파일을 먼저 찾고 실제 SPA 경로에 index.html을 제공한다.
const outputConfig = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(?:js|css|img|fonts)/.*', status: 404 },
    { src: '/.*', dest: '/index.html' }
  ]
};
function inventory(root) {
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error('정적 산출물의 symlink는 허용하지 않습니다.');
      if (entry.name.startsWith('.')) throw new Error('숨김 파일은 업로드하지 않습니다.');
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) {
        if (!/\.(html|js|css|json|map|ico|png|jpe?g|svg|woff2?|ttf|eot|webp|avif|gif|txt)$/i.test(entry.name)) throw new Error('알 수 없는 정적 파일: ' + entry.name);
        const data = fs.readFileSync(absolute);
        files.push({ path: path.relative(root, absolute).replaceAll('\\', '/'), bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
      }
    }
  }
  walk(root);
  return files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
}
function packageOutput(root, env = process.env) {
  const apiOrigin = checkProductionEnv(env, root);
  const dist = path.join(root, 'dist');
  const output = path.join(root, '.vercel/output');
  if (fs.existsSync(output)) throw new Error('기존 .vercel/output을 덮어쓰지 않습니다. 새 CI workspace에서 실행하세요.');
  if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('production dist/index.html이 필요합니다.');
  const files = inventory(dist);
  const scripts = files.filter(file => file.path.endsWith('.js'));
  if (!scripts.some(file => fs.readFileSync(path.join(dist, file.path), 'utf8').includes(apiOrigin))) throw new Error('번들에 기대한 API 주소가 없습니다. 환경변수 변경 후 다시 빌드하세요.');
  fs.mkdirSync(output, { recursive: true });
  fs.cpSync(dist, path.join(output, 'static'), { recursive: true, errorOnExist: true, force: false });
  fs.writeFileSync(path.join(output, 'config.json'), JSON.stringify(outputConfig, null, 2) + '\n');
  const evidence = { apiOrigin, nodeVersion: process.version, builtAt: new Date().toISOString(), files,
    artifactSha256: createHash('sha256').update(JSON.stringify(files)).digest('hex') };
  fs.mkdirSync(path.join(root, '.local'), { recursive: true });
  fs.writeFileSync(path.join(root, '.local/build-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  return evidence;
}
module.exports = { outputConfig, inventory, packageOutput };
if (require.main === module) {
  try { const evidence = packageOutput(path.resolve(__dirname, '..')); console.log('Vercel 정적 패키지 준비: ' + evidence.files.length + '개, SHA256 ' + evidence.artifactSha256); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
