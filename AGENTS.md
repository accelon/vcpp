# AGENTS.md — `vcpp` 工作區（金剛經合注）

> 2026-11-04 作者指示：《金剛經合注》從 `D:\2026\zhu-combined` 分出來，獨立成這個工作區，
> 版控家改為 <https://github.com/accelon/vcpp>。
> 本檔只寫「這一區的差異」；共用紀律在 agent-norms 與母工作區，**不要複製過來**。

## 0. 先讀（紀律來源，留在原處）

| 順序 | 文件 | 為什麼 |
|---|---|---|
| 1 | `D:\2026\agent-norms\README.md` | 規範總目；「開新工作區」的 canonical 是 `new-workspace.md` |
| 2 | `D:\2026\agent-norms\yap-software-practice.md` | 作者預設做法；**§12 背景工作與子行程對所有工作區有效** |
| 3 | `D:\2026\adb-converter\AGENTS.md` | 母工作區規則；本區語料（**唯讀**）來自它的 `build\` |
| 4 | 本區 [`deploy.md`](deploy.md) | 部署目標、憑證、回滾、`/incubator/` 共用目錄的紀律 |
| 5 | `D:\2026\agent-norms\writing-skill.md` | **只在代寫／改稿作者的文章時**讀 |

## 1. 這個工作區做什麼

- **產出**：純靜態《金剛經》對讀站——羅什主文（昭明三十二分）＋ 41 家注疏 ＋ 梵藏逐詞 ＋ 11 種別譯。
  - 開發版：`index.html` ＋ `app.js` ＋ `zhu-data.js`（`file://` 直接開，不需要伺服器）。
  - 部署版：單檔 `vcpp.html`，CSS／JS／資料全部內嵌（gzip ＋ base64），由 `node build-vcpp.mjs` 產生。
- **線上**：<https://shutonggui.cn/incubator/vcpp.html>（鏡像 <https://nissaya.cn/incubator/vcpp.html>）。
- **來源**：
  - 專案檔案：2026-11-04 起由 `D:\2026\zhu-combined` 移入（作者親自搬；搬完舊區停用）。
  - 語料：`D:\2026\adb-converter\build`（`tei-all.txt`、`wxzj-tei-2026R2.txt`、`ys-text-full.txt`、
    `jingqun\*.tsv`）——**只讀**；可用 `$env:ZHU_CORPUS` 指向別處。
  - 原始 PDF／docx：`vendor\`（不進版控，來源見 `README.md`「資料來源」）。
- **成品位置**：線上兩站；本機的 `vcpp.html`（含 `vcpp-kepan.html`、`vcpp-nokepan.html`）是建置產物，
  **不進版控**，也不要留在 `out\`。
- **母工作區**：`D:\2026\adb-converter`（語料與 adb 規則、版本紀錄的家）。

## 2. 共用程式（不要重寫一份）

| 用途 | 用哪一個 |
|---|---|
| 語料／漢字／頁座標／VA 等 adb 工具 | `D:\2026\adb-converter\ts\`；缺東西**回母區補** |
| 操作導覽引擎 | 已 vendored 在 `src\tour\`（來源與版本見 `src\tour\VENDOR.md`） |
| 單檔打包 | **閱讀器** `D:\2026\zhu-combined\build-vcpp.mjs`／`build-vcpp-kepan.mjs`（程式讀閱讀器目錄、資料讀本區）；本區只留 `build.mjs` 包裝
| 部署 | 本區 `deploy.mjs`、`deploy-incubator.mjs`（憑證在 `.local\`） |

發現共用 helper 有問題，回母區或 agent-norms 修；新增一份等價實作前，先問作者。

## 3. 工作流程

```text
① 取源（語料唯讀；PDF／docx 放 vendor\，不進版控）
② 資料管線：bun run build/build-data.ts → zhu-data.js
   （Conze／今譯／中台／成觀／Muller 的抽取與對齊見 README「重建」）
③ 改前端：index.html／app.js／style.css；導覽改 tours\*.tour 後跑 bun run build-tour.mjs
④ 單檔：node build.mjs（叫閱讀器的打包器；預設收全部全文，約 3MB；--limit 40000 是輕量版）
⑤ 部署：node deploy.mjs --check → node deploy.mjs（**只有作者明說才做**）
⑥ 驗證＋記帳
```

- 腳本照原專案放 `build\`／根目錄；中間產物（`build\_*`、`screenshots\`）不進版控。
- 建置要能**從零重跑**：來源、指令、版本寫在 `README.md`／`deploy.md`。
- 長跑工作（CDP 截圖、整頁長圖）要加 timeout，收工前連子行程一起收（`yap-software-practice.md` §12）。

## 4. 版本、發布、記帳

1. **建置記帳**：本區 [`docs\build-log.md`](docs/build-log.md)，一列寫日期／版本或 sha／大小／buildTime／說明。
   > 不記在母區版本紀錄：母區那本記的是 adb 成品，本區產出是靜態站，混在一起查不到。
2. **發布**：`node deploy.mjs` 上傳 `/var/www/html/incubator`，**只有作者明說才做**；發布後一定驗線上
   （HTTP 200、含 `金剛經合注`／`zhu-b64`／`__startApp`、≤ 8 MiB）。
3. **`/incubator/` 是共用目錄**：只換 `vcpp.html`、`vcpp.html.gz`、`shuzheng-u38.md`；**不上傳 `index.html`**，
   不動 `projects.json`，不留 `.prev` 以外的備份。
   > ⚠️ `/huixintang/` 是官網工作區的目錄，2026-11-04 誤覆蓋過它的 `index.html`——不要往那裡寫。

## 5. 文件

| 檔案 | 內容 |
|---|---|
| `README.md` | 來源、指令、成品、限制（給下一個接手的人） |
| `deploy.md` | 部署目標、憑證位置、回滾、傳輸壓縮 |
| `alignment-skill.md` | 新譯本對到句庫的做法 |
| `KEPAN.md` | 科判版的來源與做法 |
| `docs\build-log.md` | 每次建置一列 |

- 決策紀錄：偏離 agent-norms 預設時，寫「為什麼」與「什麼情況改回來」。
- 文件、UI、註解用繁體中文；程式識別字用英文。

## 6. 不要做的事

- 不要改 `D:\2026\adb-converter` 的語料與程式（**唯讀**）；共用 bug 回母區修。
- 不要跨區複製檔案當「最新版」；也不要 `zhu-combined` 與本區同時重建同一份成品。
- 不要 `git add -A`、`git reset --hard`、`git restore .`；作者沒說就不要 commit／push。
- 不要把 `vendor\`、`.local\`、`vcpp*.html`、`node_modules\`、原始語料 commit 進 git。
- 不要在未經指示時發布、覆寫線上，或改別區的狀態檔。

## 7. 交接（工作區停用前）

- [ ] 最後一次建置能從零重跑（來源、版本、參數）
- [ ] `docs\build-log.md` 有最後一列（sha／大小／buildTime／說明）
- [ ] `README.md` 寫清楚「已停用，維護看哪一份」
- [ ] 背景工作與子行程收乾淨

## 8. 搬遷追蹤（2026-11-04；搬完把這段刪掉）

- [ ] `zhu-combined` 的檔案（除 `vendor\`、`.local\`、`vcpp*.html` 等產物）移到本區
- [ ] 硬編碼路徑 `D:\2026\zhu-combined` → `D:\2026\vcpp`（`grep -r "zhu-combined"` 可查，約 20 個檔）：
  `build-vcpp.mjs`、`build-vcpp-kepan.mjs`、`deploy.mjs`、`deploy-incubator.mjs`、`build\build-data.ts`、
  `build\research.ts`、`build\sync-mirror.mjs`、`build\kepan\*.mjs`、`build\cdp-*.mjs`、`build\perf.mjs`、
  `build\shots-*.mjs`、`README.md`、`deploy.md`、`KEPAN.md`、`index.html`、`app.js`、`deploy\incubator.json`
- [ ] `index.html` 的 `<title>` 改「金剛經合注 · vcpp」（`build-vcpp.mjs` 靠字串比對換標題）
- [ ] `README.md` 的線上／原始碼連結改指 <https://github.com/accelon/vcpp>
- [ ] 舊區 `D:\2026\zhu-combined`：README 標「已停用，維護看 vcpp」，推最後一個 commit
