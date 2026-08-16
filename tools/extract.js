// 从 minified bundle 中提取候选 UI 字符串
// 用法: node tools/extract.js
const fs = require('fs');

const FILE = process.argv[2] || 'extracted/out/editor/assets/index.js';
const OUT = process.argv[3] || 'work/candidates.jsonl';
const src = fs.readFileSync(FILE, 'utf8');

// key:"value" 形式，value 允许转义
const KV_RE = /([A-Za-z_$][\w$]*):"((?:[^"\\\n]|\\.)*)"/g;
// 独立长句参数：, "Some sentence..." 或 ( "..." —— 大写开头、>=20 字符、含空格
const SENT_RE = /[,([:;]\s*"([A-Z][^"\\\n]{19,})"/g;

// 明确的 UI key 白名单
const UI_KEYS = new Set([
  'children', 'placeholder', 'title', 'label', 'tooltip', 'description',
  'message', 'error', 'text', 'subtitle', 'caption', 'hint', 'heading',
  'confirmText', 'okText', 'cancelText', 'header', 'content', 'subtitle',
  'summary', 'detail', 'warning', 'success', 'empty', 'textValue', 'aria-label',
  'prompt', 'question', 'body',
]);

// 跳过：明显是代码/协议/格式的值
function isCodeLike(s) {
  if (!s) return true;
  if (/^[a-z0-9_.\-:/]+$/.test(s)) return true;            // 全小写技术 token
  if (/^(https?:|mailto:|cursor:|vscode:)/.test(s)) return true; // URL
  if (/[{}<>]/.test(s) && !/[a-zA-Z]{3,}\s+[a-zA-Z]{3,}/.test(s)) return true; // 代码痕迹且无自然语言
  if (/^expected |^Invalid |^Unknown node|^Cannot read|^is not a function|^Unexpected/.test(s) && s.length < 30) return true;
  return false;
}

const map = new Map(); // en -> { keys:Set, count, fromSentence }

function add(en, key, fromSentence) {
  let e = map.get(en);
  if (!e) { e = { keys: new Set(), count: 0, fromSentence }; map.set(en, e); }
  e.keys.add(key);
  e.count++;
}

let m;
KV_RE.lastIndex = 0;
while ((m = KV_RE.exec(src)) !== null) {
  const key = m[1], val = m[2];
  if (!UI_KEYS.has(key)) continue;
  if (isCodeLike(val)) continue;
  if (!/[a-zA-Z]/.test(val)) continue;
  add(val, key, false);
}

SENT_RE.lastIndex = 0;
while ((m = SENT_RE.exec(src)) !== null) {
  const val = m[1];
  if (map.has(val)) continue;         // 已由 KV 覆盖（回写时会按句子单独处理，避免重复统计）
  if (!/[a-z]{3,}\s+[a-z]{3,}/.test(val)) continue; // 需要像自然语言
  if (isCodeLike(val)) continue;
  add(val, '(sentence)', true);
}

fs.mkdirSync('work', { recursive: true });
const rows = [...map.entries()].map(([en, e], i) => ({
  id: i, en, keys: [...e.keys].join(','), count: e.count, sentence: e.fromSentence,
}));
fs.writeFileSync(OUT, rows.map(r => JSON.stringify(r)).join('\n'));
console.error(`共 ${rows.length} 条唯一字符串, 按key: ${rows.filter(r=>!r.sentence).length}, 句子: ${rows.filter(r=>r.sentence).length}`);
