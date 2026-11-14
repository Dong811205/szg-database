# 上漲谷｜冒險資料庫

公開網站：https://dong811205.github.io/szg-database/

TMS v113 目標資料；裝備、卷軸、消耗品、怪物、雙向掉落查詢、題庫與依部位配裝比較。

- 深藍色介面，更新紀錄依日期由新至舊。
- 配裝比較顯示「本系統測試中，數值不一定準確」。
- 全站循環播放〈楓之島〉；播放、關閉與音量設定儲存在玩家瀏覽器。切換站內分頁不中斷音樂。瀏覽器若阻擋自動播放，首次互動後啟動。
- `quiz.html` 與 `changelog.html` 舊連結會進入對應分頁。

## 更新資料與發布

1. 更新 `public/data/database.json`，保留 `items`、`mobs`、`links`、`quiz`、`images`、`meta`、`changelog`。
2. 執行 `npm install`，再執行 `npm run build`。
3. 建置會產生 `dist/`，並同步發布檔至專案根目錄。將原始碼與發布檔一併提交到 `main`；GitHub Pages 會從根目錄發布。

`src/` 為介面原始碼；`index.source.html` 是建置入口；`public/audio/maple-island.mp3` 為使用者提供的音樂。

部分資料源於 GMS83／HeavenMS 社群來源，非台版 v113 正服逐項核驗。
