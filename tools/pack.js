// 重新打包 macOS 版 asar，保持与原包相同的 unpack 规则
// 用法: 先解包原 asar 并打补丁，然后
//   node tools/pack.js [原 asar 路径] [输入目录]
// 原 asar 默认 /Applications/Pen.app/...；在非 macOS 环境从 dmg 构建时传
// 解出的原包路径（用于 unpacked 集合校验）。输入目录默认 extracted。
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
  const origAsar = process.argv[2] || '/Applications/Pen.app/Contents/Resources/app.asar';
  const inDir = process.argv[3] || 'extracted';
  fs.mkdirSync('build', { recursive: true });
  await asar.createPackageWithOptions(inDir, 'build/app-mac.asar', {
    unpackDir: '{' + UNPACK_DIRS + '}',
    unpack: 'mcp-server-darwin-arm64',
  });
  console.log('打包完成');

  // 校验：对比原 asar header 标记的 unpacked 集合与新包实际 unpacked 集合
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
  const newF = list('build/app-mac.asar.unpacked');
  const onlyOld = oldF.filter(f => !newF.includes(f));
  const onlyNew = newF.filter(f => !oldF.includes(f));
  console.log(`原 unpacked: ${oldF.length}, 新 unpacked: ${newF.length}`);
  if (onlyOld.length) console.log('仅原包有:', onlyOld);
  if (onlyNew.length) console.log('仅新包有:', onlyNew);
  if (!onlyOld.length && !onlyNew.length) console.log('✓ unpacked 集合一致');
  // 校验可执行位
  const bin = 'build/app-mac.asar.unpacked/out/mcp-server-darwin-arm64';
  console.log('mcp-server 权限:', (fs.statSync(bin).mode & 0o777).toString(8));
})();
