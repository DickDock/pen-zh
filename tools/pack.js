// 重新打包 asar，保持与原包相同的 unpack 规则
const asar = require('@electron/asar');
const fs = require('fs');
const path = require('path');

const UNPACK_DIRS = [
  'node_modules/@anthropic-ai/claude-agent-sdk',
  'node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64',
  'node_modules/@cursor/sdk-darwin-arm64',
  'node_modules/@earendil-works/pi-tui',
  'node_modules/@mariozechner/clipboard-darwin-arm64',
  'node_modules/@mariozechner/clipboard-darwin-universal',
  'node_modules/@openai/codex',
  'node_modules/@openai/codex-darwin-arm64',
  'node_modules/@openai/codex-sdk',
].join(',');

(async () => {
  fs.mkdirSync('build', { recursive: true });
  await asar.createPackageWithOptions('extracted', 'build/app.asar', {
    unpackDir: '{' + UNPACK_DIRS + '}',
    unpack: 'mcp-server-darwin-arm64',
  });
  console.log('打包完成');

  // 校验：对比新旧 unpacked 文件集合
  const list = (root) => {
    const out = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p); else out.push(path.relative(root, p));
      }
    };
    walk(root);
    return out.sort();
  };
  const oldF = list('/Applications/Pen.app/Contents/Resources/app.asar.unpacked');
  const newF = list('build/app.asar.unpacked');
  const onlyOld = oldF.filter(f => !newF.includes(f));
  const onlyNew = newF.filter(f => !oldF.includes(f));
  console.log(`原 unpacked: ${oldF.length}, 新 unpacked: ${newF.length}`);
  if (onlyOld.length) console.log('仅原包有:', onlyOld);
  if (onlyNew.length) console.log('仅新包有:', onlyNew);
  if (!onlyOld.length && !onlyNew.length) console.log('✓ unpacked 集合一致');
  // 校验可执行位
  const bin = 'build/app.asar.unpacked/out/mcp-server-darwin-arm64';
  console.log('mcp-server 权限:', (fs.statSync(bin).mode & 0o777).toString(8));
})();
