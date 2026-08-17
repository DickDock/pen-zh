// 临时检查：统计映射中英文原文作为完整 "字面量" 仍残留于 bundle 的条目
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

const file = process.argv[2] || 'win-extracted/out/editor/assets/index.js';
const src = fs.readFileSync(file, 'utf8');
const remain = [];
for (const [en] of enMap) {
  const n = src.split('"' + en + '"').length - 1;
  if (n > 0) remain.push([n, en]);
}
console.log(`完整字面量仍残留的条目: ${remain.length}/875 (${file})`);
remain.sort((a, b) => b[0] - a[0]);
remain.forEach(([n, e]) => console.log(`  ${n}\t${e.slice(0, 70)}`));
