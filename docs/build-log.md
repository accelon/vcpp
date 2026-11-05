# vcpp 建置紀錄

每次建置加一列：日期／版本或 sha／大小／buildTime／工作區／說明。
（母區 `adb-converter` 的版本紀錄只記 adb 成品；本區產出是靜態站，記在這裡。）

| 日期 | 版本／sha | 大小 | buildTime | 說明 |
|---|---|---|---|---|
| 2026-11-04 | — | — | — | 工作區建立，等待 `zhu-combined` 的檔案移入；尚無建置 |
| 2026-11-04 | 剝離後首次建置 | vcpp-kepan.html 3,164,462 / vcpp-nokepan.html 3,056,673 | — | 閱讀器（zhu-combined dev）與內容分家；打包器留在閱讀器，`node build.mjs` 從本區建置 |
| 2026-11-04 | 0460352d（vcpp-kepan.html sha256） | vcpp-kepan.html 3,201,666 bytes（3.05 MiB）／gz 2,298,593 | 2026-11-04T12:56:53.425Z | 資料分離版上線（閱讀器 dev `b39229f`）：資料與舊版逐部相同，只多 `meta`（頁尾／書證連結）；另修 boot 腳本順序（tour 先於 app，🦮 才不會被收起來；本機未提交）。已部署兩站，md5 `a54e07ee059d2f2a61e354c2ecf3ad49`。`vcpp-nokepan.html` 凍結，不再上傳 |
| 2026-11-04 | 14acccec（vcpp.html sha256） | vcpp.html 3,207,755 bytes（3.06 MiB）／gz 2,300,192 | 2026-11-04T13:10:40.755Z | PWA 版（閱讀器 dev `bbf4204`）：manifest／sw.js／icon-192/512；成品就叫 `vcpp.html`（不再有 `vcpp-kepan.html`），`build.mjs` 只建這一支；`vcpp-nokepan.html` 凍結。兩站已部署，md5 `aae488da21c94a56eb35f8ec5cacea8c`，可安裝、SW active、離線可開 |
| 2026-11-05 | 21b73c28（vcpp.html sha256） | vcpp.html 3,226,956 bytes（3.08 MiB） | 2026-11-05T06:29:22Z（kepan-data） | 科判加第五家「十八住處」（99 節，無著《金剛般若論》系）：幕布 explore/5EzhFDPiNin → `build/fetch-mubu.mjs` 抓全文 → 閱讀器 `build/kepan/mubu.mjs` 釘 99 個 (u,off)（簡轉繁 opencc s2tw）；`build/kepan/build.mjs` 的 note、KEPAN.md、README 同步。順修 `build-kepan.mjs` 的 earlyMove 在 `?kepan=off` 時仍掛 kb-layer、把「分」下拉與經文裡那條 chapter-nav 收掉的舊 bug。cdp-kepan 54 項全過。**未部署** |
