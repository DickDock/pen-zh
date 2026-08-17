// 平台无关的翻译回写：按「英文原文 -> 中文」映射替换，不依赖 candidates id
// 用法: node tools/apply-map.js <bundle.js>
// 映射来源: work/candidates.jsonl (英文原文) + work/zh-batch-*.tsv (id->中文)
const fs = require('fs');

const inFile = process.argv[2];
if (!inFile) { console.error('用法: node tools/apply-map.js <bundle.js>'); process.exit(1); }
const cands = fs.readFileSync('work/candidates.jsonl', 'utf8').split('\n').filter(Boolean).map(JSON.parse);

// 合并全部 TSV -> id -> 中文
const zh = {};
for (const f of fs.readdirSync('work').filter(f => /^zh-batch-\d+\.tsv$/.test(f))) {
  for (const line of fs.readFileSync('work/' + f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const tab = line.indexOf('\t');
    zh[+line.slice(0, tab)] = line.slice(tab + 1);
  }
}

// en -> { zh, sentence, keys }
const enMap = new Map();
for (const c of cands) {
  const t = zh[c.id];
  if (!t) continue;
  enMap.set(c.en, { zh: t, sentence: c.sentence, keys: c.keys.split(',') });
}

// UI 安全前缀：这些位置只做展示（tooltip / React 子节点 / 无障碍标签），
// 不会是逻辑判断值，替换无副作用。新版 bundle 常把 label/content 换成这些形式。
const SAFE_PREFIXES = ['title:"', 'children:"', 'children:["', '"aria-label":"'];

let src = fs.readFileSync(inFile, 'utf8');
let applied = 0, noHit = 0, safeExtra = 0;
const noHitList = [];
for (const [en, v] of enMap) {
  if (v.sentence) {
    const from = '"' + en + '"', to = '"' + v.zh + '"';
    const n = src.split(from).length - 1;
    if (n === 0) { noHit++; noHitList.push(en.slice(0, 60)); continue; }
    src = src.split(from).join(to);
    applied++;
  } else {
    let hit = false;
    for (const key of v.keys) {
      const from = key + ':"' + en + '"', to = key + ':"' + v.zh + '"';
      const n = src.split(from).length - 1;
      if (n === 0) continue;
      src = src.split(from).join(to);
      hit = true;
    }
    // key 形式未命中或命中后，再补扫安全前缀位置的残留
    for (const p of SAFE_PREFIXES) {
      const from = p + en + '"';
      if (!src.includes(from)) continue;
      src = src.split(from).join(p + v.zh + '"');
      hit = true; safeExtra++;
    }
    if (hit) applied++; else { noHit++; noHitList.push(en.slice(0, 60)); }
  }
}

fs.writeFileSync(inFile, src);
console.error(`已应用: ${applied}, 未命中(该平台 bundle 中不存在): ${noHit}/${enMap.size}, 安全前缀位置补翻: ${safeExtra}`);
if (noHitList.length) noHitList.forEach(s => console.error('  ✗ ' + s));
