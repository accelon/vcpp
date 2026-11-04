# vcpp 建置紀錄

每次建置加一列：日期／版本或 sha／大小／buildTime／工作區／說明。
（母區 `adb-converter` 的版本紀錄只記 adb 成品；本區產出是靜態站，記在這裡。）

| 日期 | 版本／sha | 大小 | buildTime | 說明 |
|---|---|---|---|---|
| 2026-11-04 | — | — | — | 工作區建立，等待 `zhu-combined` 的檔案移入；尚無建置 |
| 2026-11-04 | 剝離後首次建置 | vcpp-kepan.html 3,164,462 / vcpp-nokepan.html 3,056,673 | — | 閱讀器（zhu-combined dev）與內容分家；打包器留在閱讀器，`node build.mjs` 從本區建置 |
