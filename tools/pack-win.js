// 重新打包 Windows 版 asar，保持与原包相同的 unpack 规则
// 用法: 先解包原 asar 到 win-extracted 并打补丁，然后
//   node tools/pack-win.js [原 asar 路径]
// 原 asar 默认取 win-dl（从安装包解出的目录）；直接从已安装目录工作时可传
// /mnt/c/.../Program\ Files/Pen/resources/app.asar
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

  // 校验：对比原 asar header 标记的 unpacked 集合与新包实际 unpacked 集合
  // （不再依赖 win-dl 目录，直接从已安装目录提取的场景也能校验）
  const origAsar = process.argv[2] || 'win-dl/app/resources/app.asar';
  const { header } = await asar.getRawHeader(origAsar);
  const oldF = [];
  const walkHeader = (files, prefix) => {
    for (const [name, meta] of Object.entries(files)) {
      const p = prefix ? prefix + '/' + name : name;
      if (meta.files) walkHeader(meta.files, p);
      else if (meta.unpacked) oldF.push(p);
    }
  };
  walkHeader(header.files, '');
  oldF.sort();

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
  const newF = list('build/app-win.asar.unpacked');
  const onlyOld = oldF.filter(f => !newF.includes(f));
  const onlyNew = newF.filter(f => !oldF.includes(f));
  console.log(`原 unpacked: ${oldF.length}, 新 unpacked: ${newF.length}`);
  if (onlyOld.length) console.log('仅原包有:', onlyOld);
  if (onlyNew.length) console.log('仅新包有:', onlyNew);
  if (!onlyOld.length && !onlyNew.length) console.log('✓ unpacked 集合一致');
})();
