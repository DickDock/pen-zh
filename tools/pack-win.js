// 重新打包 Windows 版 asar，保持与原包相同的 unpack 规则
// 用法: 先解包原 asar 到 win-extracted 并打补丁，然后 node tools/pack-win.js
const asar = require('@electron/asar');
const fs = require('fs');
const path = require('path');

const UNPACK_DIRS = [
  'node_modules/@anthropic-ai/claude-agent-sdk',
  'node_modules/@anthropic-ai/claude-agent-sdk-win32-x64',
  'node_modules/@cursor/sdk-win32-x64',
  'node_modules/@earendil-works/pi-tui',
  'node_modules/@mariozechner/clipboard-win32-x64-msvc',
  'node_modules/@openai/codex',
  'node_modules/@openai/codex-win32-x64',
  'node_modules/@openai/codex-sdk',
].join(',');

(async () => {
  fs.mkdirSync('build', { recursive: true });
  await asar.createPackageWithOptions('win-extracted', 'build/app-win.asar', {
    unpackDir: '{' + UNPACK_DIRS + '}',
    unpack: '**/mcp-server-windows-x64.exe',
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
  const oldF = list('win-dl/app/resources/app.asar.unpacked');
  const newF = list('build/app-win.asar.unpacked');
  const onlyOld = oldF.filter(f => !newF.includes(f));
  const onlyNew = newF.filter(f => !oldF.includes(f));
  console.log(`原 unpacked: ${oldF.length}, 新 unpacked: ${newF.length}`);
  if (onlyOld.length) console.log('仅原包有:', onlyOld);
  if (onlyNew.length) console.log('仅新包有:', onlyNew);
  if (!onlyOld.length && !onlyNew.length) console.log('✓ unpacked 集合一致');
})();
