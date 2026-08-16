// 将 TSV 翻译应用回 minified bundle
// 用法: node tools/apply.js <in.js> <out.js>
const fs = require('fs');

const inFile = process.argv[2] || 'extracted/out/editor/assets/index.js';
const outFile = process.argv[3] || inFile;
const cands = fs.readFileSync('work/candidates.jsonl', 'utf8').split('\n').filter(Boolean).map(JSON.parse);

// 合并全部 TSV
const zh = {};
for (const f of fs.readdirSync('work').filter(f => /^zh-batch-\d+\.tsv$/.test(f))) {
  for (const line of fs.readFileSync('work/' + f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const tab = line.indexOf('\t');
    const id = line.slice(0, tab), val = line.slice(tab + 1);
    zh[+id] = val;
  }
}

let src = fs.readFileSync(inFile, 'utf8');
let applied = 0, missing = [], zeroKeys = [];
const missingPairs = [];

for (const c of cands) {
  const t = zh[c.id];
  if (!t) continue;
  applied++;
  if (c.sentence) {
    const from = '"' + c.en + '"';
    const to = '"' + t + '"';
    const n = src.split(from).length - 1;
    if (n === 0) { zeroKeys.push(c.id + ' ' + from.slice(0, 60)); continue; }
    src = src.split(from).join(to);
  } else {
    for (const key of c.keys.split(',')) {
      const from = key + ':"' + c.en + '"';
      const to = key + ':"' + t + '"';
      const n = src.split(from).length - 1;
      if (n === 0) { missingPairs.push(from); continue; }
      src = src.split(from).join(to);
    }
  }
}

fs.writeFileSync(outFile, src);
console.error(`已翻译条目: ${applied}/${Object.keys(zh).length}`);
if (missingPairs.length) {
  console.error(`未找到匹配的 key 对 (${missingPairs.length}):`);
  missingPairs.forEach(p => console.error('  ' + p.slice(0, 80)));
}
if (zeroKeys.length) {
  console.error(`未找到匹配的句子 (${zeroKeys.length}):`);
  zeroKeys.forEach(p => console.error('  ' + p));
}
