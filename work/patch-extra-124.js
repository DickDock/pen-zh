// 1.2.4 Windows bundle 定点补丁：处理 key 形式与安全前缀都覆盖不到的展示位
// （错误回退值 / 三元回退 / children 数组文本 / alt 属性等），翻译取自 enMap。
// 逻辑值（枚举、键盘码、类型判断）刻意不翻。
const fs = require('fs');

const cands = fs.readFileSync('work/candidates.jsonl', 'utf8').split('\n').filter(Boolean).map(JSON.parse);
const zh = {};
for (const f of fs.readdirSync('work').filter(f => /^zh-batch-\d+\.tsv$/.test(f)))
  for (const line of fs.readFileSync('work/' + f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const t = line.indexOf('\t'); zh[+line.slice(0, t)] = line.slice(t + 1);
  }
const enMap = new Map();
for (const c of cands) { const t = zh[c.id]; if (t) enMap.set(c.en, t); }
const T = en => {
  const t = enMap.get(en);
  if (!t) { console.error(`!! 映射缺少: ${en}`); process.exitCode = 1; return en; }
  return t;
};

const file = process.argv[2] || 'win-extracted/out/editor/assets/index.js';
let src = fs.readFileSync(file, 'utf8');

// 模式：["原文匹配（原文用 ${en} 占位）", 翻译来源原文]
const rules = [
  // 错误/状态回退值（展示给用户）
  [`value:"Unknown error"`, () => `value:"${T('Unknown error')}"`],
  [`??"All systems operational"`, () => `??"${T('All systems operational')}"`],
  [`||"The browser tool failed."`, () => `||"${T('The browser tool failed.')}"`],
  [`Error("The document is read-only.")`, () => `Error("${T('The document is read-only.')}")`],
  [`??"Import failed."`, () => `??"${T('Import failed.')}"`],
  [`??"Screenshot failed."`, () => `??"${T('Screenshot failed.')}"`],
  [`||"Failed to get share status"`, () => `||"${T('Failed to get share status')}"`],
  [`,"Failed to create share link")`, () => `,"${T('Failed to create share link')}")`],
  // 设置页标题（children 数组 / 三元回退）
  [`,"Settings"]`, () => `,"${T('Settings')}"]`],
  [`\`:"Settings"}),ee`, () => `\`:"${T('Settings')}"}),ee`],
  // 变量赋值的 UI 文案
  [`="Snapshot shared"`, () => `="${T('Snapshot shared')}"`],
  // 工具默认名（type/name/icon 数组项）
  [`name:"Import Image or SVG…"`, () => `name:"${T('Import Image or SVG…')}"`],
  [`name:"Sticky Note"`, () => `name:"${T('Sticky Note')}"`],
  [`name:"Item 1"`, () => `name:"${T('Item 1')}"`],
  // children 数组尾文本（设置页侧栏标题等）
  [`,"Agent Names"]`, () => `,"${T('Agent Names')}"]`],
  [`,"Upgrade"]`, () => `,"${T('Upgrade')}"]`],
  [`,"Account"]`, () => `,"${T('Account')}"]`],
  [`,"Chat"]`, () => `,"${T('Chat')}"]`],
  // 分页按钮
  [`?"Finish":"Next"`, () => `?"Finish":"${T('Next')}"`],
  // displayName 回退
  [`??"Model"`, () => `??"${T('Model')}"`],
  // 三元回退
  [`?"Remove slot":"Make slot"`, () => `?"${T('Remove slot')}":"${T('Make slot')}"`],
  [`?"New Agent"`, () => `?"${T('New Agent')}"`],
  // 文案表属性
  [`downloadFile:"Download file"`, () => `downloadFile:"${T('Download file')}"`],
  // alt 属性（无障碍）
  [`alt:"Align Left"`, () => `alt:"${T('Align Left')}"`],
  [`alt:"Align Center"`, () => `alt:"${T('Align Center')}"`],
  [`alt:"Align Right"`, () => `alt:"${T('Align Right')}"`],
  [`alt:"Align Top"`, () => `alt:"${T('Align Top')}"`],
  [`alt:"Align Middle"`, () => `alt:"${T('Align Middle')}"`],
  [`alt:"Align Bottom"`, () => `alt:"${T('Align Bottom')}"`],
  // 单引号字符串里嵌套的提示文案
  [`'or click "Create Component" above'`, () => `'或点击上方的"创建组件"'`],
];

let ok = 0, fail = 0;
for (const [from, to] of rules) {
  const n = src.split(from).length - 1;
  if (n === 0) { console.error(`✗ 未匹配: ${from}`); fail++; continue; }
  src = src.split(from).join(to());
  ok++;
}
fs.writeFileSync(file, src);
console.error(`✓ 定点补丁: ${ok} 条应用, ${fail} 条未匹配`);
