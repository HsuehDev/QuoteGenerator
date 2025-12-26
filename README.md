# 報價單產生器 Quote Generator

一個專為台灣公司設計的現代化報價單生成與管理工具，支援拖拽排序、多格式匯出與本地持久化儲存。

**A modern quotation generator and management tool designed for Taiwanese companies. Create, manage, and export professional quotations with drag-and-drop item ordering, multiple export formats (Excel, PDF, Image), and local data persistence.**

---

## 📑 目錄

- [✨ 功能特色](#-功能特色)
- [📸 Demo / Screenshots](#-demo--screenshots)
- [📖 使用指南](#-使用指南)
- [❓ 常見問題](#-常見問題)
- [🚢 部署指南](#-部署指南)
  - [📦 NPM 部署](#-npm-部署)
  - [🐳 Docker 部署](#-docker-部署)
- [🛠️ 技術棧](#️-技術棧)
- [📄 License](#-license)
- [📞 聯絡與回饋](#-聯絡與回饋)

---

## ✨ 功能特色

- **📋 報價單管理**：建立與編輯報價單，管理客戶與服務提供方資訊，支援多個報價項目，自動計算總金額與稅額（內含/外加/不計算）
- **🔄 拖拽排序**：使用 `@dnd-kit` 實現流暢的拖拽排序功能
- **📤 多格式匯出**：支援 Excel、PDF、圖片（JPG）格式匯出
- **💾 本地持久化**：自動儲存到 localStorage，支援歷史記錄管理（最多 5 筆）
- **🌙 暗色模式**：支援 Tailwind CSS 暗色模式

---

## 📸 Demo / Screenshots

![報價單產生器截圖](./docs/screenshot.png)

---

## 📖 使用指南

1. **建立報價單**：填寫基本資訊、客戶資訊、服務提供方資訊
2. **新增報價項目**：填寫品項名稱、描述、數量、單價（系統自動計算小計）
3. **拖拽排序**：按住項目左側拖拽圖示調整順序
4. **匯出報價單**：點擊頂部匯出按鈕（JPG / PDF / Excel）
5. **管理歷史記錄**：點擊右上角歷史記錄圖示查看、載入或刪除

---

## ❓ 常見問題

**Q: 匯出的 PDF 排版與畫面顯示不一致？**  
A: html2canvas 可能無法完美還原某些 CSS 樣式（如 `backdrop-filter`），建議調整 `scale` 參數或確認內容已完全載入。

**Q: 拖拽功能在行動裝置上無法使用？**  
A: `@dnd-kit` 預設支援觸控操作，請確認瀏覽器版本是否過舊。

**Q: 清除瀏覽器資料後，報價單歷史記錄消失了？**  
A: 本專案使用 localStorage 儲存資料，清除瀏覽器資料會導致資料遺失。建議定期匯出重要報價單作為備份。

**Q: 如何自訂報價單樣式？**  
A: 修改 `src/components/QuotationDisplay.tsx` 中的 Tailwind CSS 類別，或調整 `tailwind.config.js` 主題設定。

**Q: 可以匯入現有的報價單嗎？**  
A: 目前僅支援從歷史記錄載入，Excel 匯入功能需要額外實作。

---

## 🚢 部署指南

### 📦 NPM 部署

```bash
# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

建置完成後，將 `dist/` 目錄部署到 Vercel、Netlify、GitHub Pages 等靜態網站託管服務。

### 🐳 Docker 部署

**使用 Docker Compose（推薦）**：
```bash
docker-compose up -d
```

**使用 Docker 命令**：
```bash
docker build -t quote-generator:latest .
docker run -d --name quote-generator -p 3000:80 quote-generator:latest
```

應用程式將在 `http://localhost:3000` 啟動。

---

## 🛠️ 技術棧

### 前端框架

| 技術 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| TypeScript | 5.9.3 | 類型系統 |
| Vite | 7.2.4 | 建置工具與開發伺服器 |

### 狀態管理

| 技術 | 版本 | 用途 |
|------|------|------|
| Zustand | 5.0.9 | 輕量級狀態管理 |
| Zustand Persist | - | 本地持久化中間件 |

### UI 組件庫

| 技術 | 版本 | 用途 |
|------|------|------|
| shadcn/ui | - | UI 組件系統（基於 Radix UI） |
| @radix-ui/react-dialog | ^1.1.15 | 對話框組件 |
| @radix-ui/react-label | ^2.1.8 | 標籤組件 |
| @radix-ui/react-popover | ^1.1.15 | 彈出層組件 |
| @radix-ui/react-select | ^2.2.6 | 選擇器組件 |
| @radix-ui/react-slot | ^1.2.4 | Slot 組件 |
| Vaul | 1.1.2 | 抽屜組件 |

### 樣式系統

| 技術 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | 3.4.19 | 原子化 CSS 框架 |
| PostCSS | 8.5.6 | CSS 後處理器 |
| Autoprefixer | 10.4.23 | CSS 前綴自動補全 |
| class-variance-authority | ^0.7.1 | 組件變體管理 |
| clsx | ^2.1.1 | 條件類名工具 |
| tailwind-merge | ^3.4.0 | Tailwind 類名合併 |

### 功能庫

| 技術 | 版本 | 用途 |
|------|------|------|
| @dnd-kit/core | ^6.3.1 | 拖拽核心功能 |
| @dnd-kit/sortable | ^10.0.0 | 拖拽排序功能 |
| @dnd-kit/utilities | ^3.2.2 | 拖拽工具函數 |
| date-fns | 4.1.0 | 日期處理 |
| react-day-picker | 9.13.0 | 日期選擇器 |
| lucide-react | 0.562.0 | 圖標庫 |
| exceljs | 4.4.0 | Excel 檔案生成 |
| html2canvas | 1.4.1 | HTML 轉圖片 |
| jspdf | 3.0.4 | PDF 檔案生成 |

### 開發工具

| 技術 | 版本 | 用途 |
|------|------|------|
| ESLint | 9.39.1 | 程式碼檢查 |
| TypeScript ESLint | 8.46.4 | TypeScript 專用 ESLint 規則 |
| eslint-plugin-react-hooks | ^7.0.1 | React Hooks 規則 |
| eslint-plugin-react-refresh | ^0.4.24 | React Fast Refresh 規則 |

---

## 📄 License

本專案採用 MIT License。

---

## 📞 聯絡與回饋

如有問題、建議或發現 Bug，歡迎建立 [GitHub Issue](https://github.com/your-username/quote-generator/issues) 或提交 Pull Request。
