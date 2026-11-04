// 建兩種單檔：無科判版（vcpp-nokepan.html）與科判版（vcpp-kepan.html，部署時改名 vcpp.html）。
//
// 打包器留在閱讀器工作區（預設 D:\2026\zhu-combined），這支只負責：
//   1. 把 cwd 指到本工作區（資料在這裡）；
//   2. 依序叫兩支打包器。
// 閱讀器換位置時可用環境變數 ZHU_READER 指定。
//
//   node build.mjs
//   node build.mjs --limit 40000      # 輕量版（參數原樣傳給兩支打包器）
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

run('build-vcpp.mjs', ['--out', path.join(HERE, 'vcpp-nokepan.html'), ...extra]);
run('build-vcpp-kepan.mjs', extra);
console.log('完成：vcpp-nokepan.html、vcpp-kepan.html');
