# 部署 vcpp.html

本工作區（`D:\2026\vcpp`）負責《金剛經合注》的資料、建置與部署；閱讀器程式在
`D:\2026\zhu-combined`（`dev` 分支，2026-11-04 起資料與程式分離）。
部署不寫入 `adb-converter`。

## 成品與目標

成品只有一個：**`vcpp.html`**（建置時就叫這個名字，部署原樣上傳，不再改名）。
`vcpp-nokepan.html` 是舊的「無科判」版，2026-11-04 起**凍結**：不再建置、不再上傳、不維護，
線上那一份保持原樣。

| 站 | URL | 遠端目錄 |
|---|---|---|
| 主站 | <https://shutonggui.cn/incubator/vcpp.html> | `/var/www/html/incubator` |
| 鏡像 | <https://nissaya.cn/incubator/vcpp.html> | `/var/www/html/incubator` |
| 孵化區列表 | <https://shutonggui.cn/incubator/> | `/var/www/html/incubator` |

> ⚠️ **`/huixintang/` 是官網工作區的目錄，不要往那裡寫**（2026-11-04 誤覆蓋過它的
> `index.html`）。本專案的檔案一律放 `/incubator/`，而且**不上傳 `index.html`**。

## 上傳哪些檔

`deploy.mjs` 的 `FILES`：

| 本機 | 遠端（`/incubator/` 下） | 說明 |
|---|---|---|
| `vcpp.html` | `vcpp.html` | **科判版**（正式入口，含 PWA manifest 連結） |
| （部署時現壓） | `vcpp.html.gz` | 同一份 gzip -9，給 `gzip_static` 用 |
| `vcpp.webmanifest` | `vcpp.webmanifest` | PWA manifest（`start_url: ./vcpp.html`、192／512 圖示） |
| `sw.js` | `sw.js` | 離線快取（network-first） |
| `icon-192.png`／`icon-512.png` | 同名 | PWA 圖示 |
| `shuzheng-u38.md` | `shuzheng-u38.md` | 第 38 句的書證長文（頁面連得到） |

`vcpp-nokepan.html`、`vcpp-nokepan.webmanifest` 都不上傳。

孵化區是**共用目錄**：只換上面這些檔，不動 `index.html`、`projects.json`（官網工作區的），
也不留 `.prev` 備份；清理暫存只清 `.tmp-vcpp*`、`.tmp-shuzheng*`。

`/incubator/projects.json` 的卡片由 `deploy/incubator.json` 同步（`node deploy-incubator.mjs`），
本檔案不涉及；改卡片才跑那一支。

## 建置

```powershell
cd D:\2026\vcpp
node build.mjs
```

- 閱讀器程式（`index.html`／`app.js`／`style.css`／`src/kepan/`／啟動腳本／PWA 產生器）**從
  `D:\2026\zhu-combined` 讀**；資料（`zhu-data.js`、`kepan/kepan-data.js`、`tour.js`）從本區讀。
  閱讀器換位置時用 `$env:ZHU_READER` 指定。
- 產出：`vcpp.html` ＋ `vcpp.webmanifest`、`sw.js`、`icon-192.png`、`icon-512.png`（同目錄）。
- 2026-11-04 PWA 版實測：`vcpp.html` **3,207,755 bytes／3.06 MiB**（全部全文、含操作導覽與 PWA），
  上限 8 MiB；`vcpp.html.gz` 2,300,192 bytes。`--limit 40000` 是輕量版，`--max` 可放寬上限。
- 打包器會把資料以 gzip 壓縮、base64 存放；開啟時用 `DecompressionStream('gzip')` 解回
  `window.ZHU`（＋`window.KEPAN`），沒有 `DecompressionStream` 的舊瀏覽器走純 JS 解壓。
- 改了操作導覽（`tours/*.tour`）或閱讀器的導覽引擎，先 `node build-tour.mjs`，
  發版前 `node build-tour.mjs --check` 確認 `tour.js` 與劇本同步。
- 建置後可先本機驗：見下一節「發版前檢查」。

## 發版前檢查

```powershell
node build-tour.mjs --check
node ..\zhu-combined\build\cdp-check.mjs "file:///D:/2026/vcpp/vcpp.html"            # 正常載入
node ..\zhu-combined\build\cdp-check.mjs "file:///D:/2026/vcpp/vcpp.html" --no-ds    # 舊瀏覽器解壓
node build\cdp-kepan.mjs   "file:///D:/2026/vcpp/vcpp.html" screenshots\new          # 科判／行動版
node build\cdp-trail.mjs   "file:///D:/2026/vcpp/vcpp.html"                          # 麵包屑不重畫
node build\cdp-stable.mjs  "file:///D:/2026/vcpp/vcpp.html"                          # 靜止時畫面不動
node ..\zhu-combined\build\cdp-tour.mjs "file:///D:/2026/vcpp/vcpp.html" 390 844 screenshots\tour

# PWA（service worker 只認 https／localhost，要起本機伺服器）
node ..\zhu-combined\build\serve.mjs . 8134            # 另開一個視窗，背景跑
node ..\zhu-combined\build\cdp-pwa.mjs http://127.0.0.1:8134/vcpp.html   # manifest／可安裝／SW
```

已知的過時檢查（兩版都一樣，不是改壞）：`cdp-kepan.mjs` 的「`?kepan=off` 分下拉回來」
（分導覽早已搬到標題列）、`cdp-notes.mjs` 的「長注文 100 字分段」（閱讀器已改為整段顯示）。

## 部署

```powershell
node deploy.mjs --check   # 只看兩站目錄與權限
node deploy.mjs           # 上傳、切換、HTTP 驗證
node deploy.mjs --primary-only
node deploy.mjs --mirror-only
```

- 連線憑證在 `.local/server.env`（`HOST/PORT/USER/PASS/DOCROOT`，另有 `MIRROR_HOST`）
  與 `.local/hostkey.txt`、`.local/hostkey-nissaya.cn.txt`；`.local/` 不進版控，帳密不會被印出。
- docroot 預設由 `server.env` 的 `DOCROOT` 推得：`/var/www/html/accelon26` → `/var/www/html/incubator`；
  可用 `--docroot`、`--mirror-docroot` 覆寫。
- 上傳流程：先傳 `DOCROOT/.tmp-<name>`，再遠端 `mv` 成正式檔（孵化區不留 `.prev`）。
  最後刪掉舊版留下的 `app.js`、`style.css`、`zhu-data.js`。
- 每次部署都會現壓並上傳 `vcpp.html.gz`（level 9）。伺服器 `mod_deflate` 已開；
  鏡像 nginx 用 `gzip_static on` 直接送 `.gz`。
- 工具：`C:\Program Files\PuTTY\pscp.exe`、`plink.exe`，以 `-hostkey` 鎖定指紋。

## 驗證

`deploy.mjs` 會從公開 HTTPS 抓回並檢查：

- `vcpp.html`：HTTP 200、含 `金剛經合注`、`zhu-b64`、`kbTrail`／`KEPAN`、`vcpp.webmanifest`，且 ≤ `--max`（8 MiB）。
- `vcpp.html.gz`：gzip 或伺服器解壓後與本機同大小。
- `vcpp.webmanifest`：HTTP 200、是 JSON、有 `name`／`start_url`／`icons`。
- `sw.js`、`icon-192.png`、`icon-512.png`：HTTP 200、內容正確（PNG 簽章）。
- `vcpp-nokepan.html`：HTTP 200、仍是無科判版（確認凍結檔沒被動到）。
- `shuzheng-u38.md`：HTTP 200、大小 > 1000 bytes。
- 遠端 `md5sum` 與本機 `vcpp.html`、`vcpp.html.gz` 一致。

部署完再用瀏覽器驗 PWA（線上）：

```powershell
node ..\zhu-combined\build\cdp-pwa.mjs https://shutonggui.cn/incubator/vcpp.html
```

2026-11-04 PWA 版實測（兩站皆同）：

```text
https://shutonggui.cn/incubator/vcpp.html  200  3,207,755 bytes
https://nissaya.cn/incubator/vcpp.html     200  3,207,755 bytes
manifest OK／可安裝／service worker active
```

## 傳輸壓縮

| 站 | 做法 | 實際傳輸 |
|---|---|---|
| shutonggui.cn（Apache） | `mod_deflate` 現壓（`conf-enabled/deflate-zhu.conf`） | chunked，約 2.3 MB |
| nissaya.cn（nginx） | `gzip_static on` 直接送 `vcpp.html.gz` | `vcpp.html.gz` 大小 |

**在 Windows 上用 `Invoke-WebRequest` 看不到 gzip**：它會自動解壓並把 `Content-Encoding`
拿掉，`RawContentLength` 回報的是解壓後大小。要驗證請在伺服器上跑：

```bash
curl -skI -H "Accept-Encoding: gzip" https://shutonggui.cn/incubator/vcpp.html | grep -iE 'content-encoding|vary'
curl -sk -o /dev/null -w '%{size_download}\n' -H "Accept-Encoding: gzip" https://shutonggui.cn/incubator/vcpp.html
```

## 回滾

孵化區不留 `.prev`。要回滾就把上一版放回 `vcpp.html` 再跑一次部署：

```powershell
Copy-Item .local\deployed-vcpp-20261104-2101.html vcpp.html -Force   # 上一版（md5 a54e07…）
node deploy.mjs
```

部署前的線上檔案可先抓一份放 `.local/`（`Invoke-WebRequest ... -OutFile .local\live-vcpp-YYYYMMDD.html`），
事後比對與回滾都用它。

## 與 adb-converter 的關係

- 資料管線 `build/build-data.ts` 只**讀** `D:\2026\adb-converter\build` 的語料
  （`tei-all.txt`、`wxzj-tei-2026R2.txt`、`ys-text-full.txt`、`jingqun/*.tsv`），不寫入；
  可用 `$env:ZHU_CORPUS` 指向別處。
- `vcpp.html` 的建置與部署完全在本區，不需要 adb-converter 的程式。
