// 建單檔 vcpp.html：科判版（經文＋別譯＋注疏＋科文＋PWA），部署時原樣上傳、不改名。
//
// vcpp-nokepan.html 是舊的「無科判」版，2026-11-04 起凍結：不再建置、不再上傳。
//
// 打包器留在閱讀器工作區（預設 D:\2026\zhu-combined），這支只負責：
//   1. 把 cwd 指到本工作區（資料在這裡）；
//   2. 叫閱讀器的科判版打包器。
// 閱讀器換位置時可用環境變數 ZHU_READER 指定。
//
//   node build.mjs
//   node build.mjs --limit 40000      # 輕量版（參數原樣傳給打包器）
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const READER = process.env.ZHU_READER || 'D:\\2026\\zhu-combined';
const extra = process.argv.slice(2);

const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(READER, script), ...args], { stdio: 'inherit', cwd: HERE });
  if (r.status !== 0) process.exit(r.status || 1);
};

// 書名／副標：內容工作區決定（閱讀器本身是中性的）
const TITLE = '金剛經合注';
const SUB = '11 種別譯 · 41 家注疏 · 3 家科判';

// 輕量版要保留全文的 work（印順《般若經講記》）
const KEEP = 'Y01';
const DESC = '羅什譯《金剛經》配昭明三十二分，十一種別譯、四十一家注疏、梵藏逐詞；' +
  '加上昭明／江味農／印順／宗密四套科判，科文與經文雙向連動，科文另存、離文標註。純靜態單頁。';

// --start：PWA 的 start_url；成品就叫 vcpp.html，部署原樣上傳
run('build-vcpp-kepan.mjs', ['--out', path.join(HERE, 'vcpp.html'), '--start', 'vcpp.html',
  '--title', TITLE, '--sub', SUB, '--desc', DESC, '--keep', KEEP, ...extra]);
console.log('完成：vcpp.html');
