// 編譯本區的導覽劇本（tours/*.tour → tour.js）。
// 編譯器與播放器在閱讀器；這支只把「劇本目錄、成品、App 名稱」指到本區。
//
//   node build-tour.mjs
//   node build-tour.mjs --check
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const READER = process.env.ZHU_READER || 'D:\\2026\\zhu-combined';
// 編譯器要用 bun（build-tour.mjs 內部會 spawn bun run／bun build）
const r = spawnSync(process.env.BUN || 'bun', [path.join(READER, 'build-tour.mjs'), '--root', HERE, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: HERE,
  env: Object.assign({}, process.env, { TOUR_APP: '金剛經合注' }),
});
process.exit(r.status || 0);
