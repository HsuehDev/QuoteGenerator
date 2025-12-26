# 報價單產生器 Quote Generator

一個專為台灣公司設計的現代化報價單生成與管理工具，支援拖拽排序、多格式匯出與本地持久化儲存。

**A modern quotation generator and management tool designed for Taiwanese companies. Create, manage, and export professional quotations with drag-and-drop item ordering, multiple export formats (Excel, PDF, Image), and local data persistence.**

---

## 📑 目錄

- [✨ 功能特色](#-功能特色)
  - [🎯 核心功能](#-核心功能)
- [📸 Demo / Screenshots](#-demo--screenshots)
- [🚀 快速開始](#-快速開始)
  - [環境需求](#環境需求)
  - [安裝與啟動](#安裝與啟動)
- [🚢 部署指南](#-部署指南)
  - [📦 NPM 部署（生產環境）](#-npm-部署生產環境)
    - [建置生產版本](#建置生產版本)
    - [預覽生產版本](#預覽生產版本)
    - [部署到靜態網站託管服務](#部署到靜態網站託管服務)
  - [🐳 Docker 部署](#-docker-部署)
    - [環境需求](#環境需求-1)
    - [方式一：使用 Docker Compose（推薦）](#方式一使用-docker-compose推薦)
    - [方式二：使用 Docker 命令](#方式二使用-docker-命令)
    - [Docker 配置說明](#docker-配置說明)
    - [自訂配置](#自訂配置)
    - [生產環境建議](#生產環境建議)
- [📖 使用指南](#-使用指南)
  - [基本操作流程](#基本操作流程)
- [🛠️ 技術棧](#️-技術棧)
  - [前端框架](#前端框架)
  - [狀態管理](#狀態管理)
  - [UI 組件庫](#ui-組件庫)
  - [樣式系統](#樣式系統)
  - [功能庫](#功能庫)
  - [開發工具](#開發工具)
- [📁 專案結構](#-專案結構)
  - [路徑別名](#路徑別名)
- [📤 匯出功能說明](#-匯出功能說明)
  - [Excel 匯出（ExcelJS）](#excel-匯出exceljs)
  - [PDF 匯出（jsPDF + html2canvas）](#pdf-匯出jspdf--html2canvas)
  - [圖片匯出（html2canvas）](#圖片匯出html2canvas)
  - [瀏覽器相容性](#瀏覽器相容性)
- [🤝 貢獻指南](#-貢獻指南)
  - [貢獻流程](#貢獻流程)
  - [Commit Message 慣例](#commit-message-慣例)
- [📄 License](#-license)
- [❓ 常見問題](#-常見問題)
- [📞 聯絡與回饋](#-聯絡與回饋)

---

## ✨ 功能特色

### 🎯 核心功能

- **📋 報價單管理**
  - 建立與編輯報價單，包含報價單編號、日期、有效期限等基本資訊
  - 管理客戶資訊（公司名稱、聯絡人、電話、Email、地址）
  - 管理服務提供方資訊（公司名稱、品牌名稱、統一編號、聯絡資訊）
  - 支援多個報價項目（品項名稱、描述、數量、單價、小計）
  - 自動計算總金額與稅額（支援內含/外加/不計算稅額模式）
  - 自訂備註欄位與簽章區顯示

- **🔄 拖拽排序**
  - 使用 `@dnd-kit` 實現流暢的拖拽排序功能
  - 直覺的視覺回饋，輕鬆調整報價項目順序

- **📤 多格式匯出**
  - **Excel 匯出**：使用 ExcelJS 生成結構化的 `.xlsx` 檔案
  - **PDF 匯出**：使用 jsPDF 與 html2canvas 生成高品質 PDF 文件
  - **圖片匯出**：使用 html2canvas 將報價單轉換為 JPG 圖片

- **💾 本地持久化**
  - 使用 Zustand persist middleware 自動儲存資料到 localStorage
  - 報價單歷史記錄管理（最多保留 5 筆）
  - 資料自動同步，無需手動儲存

- **🌙 暗色模式**
  - 支援 Tailwind CSS 暗色模式配置
  - 舒適的視覺體驗

---

## 📸 Demo / Screenshots

![報價單產生器截圖](./docs/screenshot.png)

> 💡 **提示**：請將實際的專案截圖放置在 `./docs/screenshot.png`，或更新此路徑指向您的截圖檔案。

---

## 🚀 快速開始

### 環境需求

- Node.js 18+ 
- pnpm / npm / yarn

### 安裝與啟動

使用 **pnpm**（推薦）：

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 建置生產版本
pnpm build

# 預覽生產版本
pnpm preview
```

使用 **npm**：

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

開發伺服器預設會在 `http://localhost:5173` 啟動。

---

## 🚢 部署指南

本專案支援多種部署方式，您可以根據需求選擇適合的部署方法。

### 📦 NPM 部署（生產環境）

#### 建置生產版本

使用 **pnpm**：
```bash
# 建置生產版本
pnpm build
```

使用 **npm**：
```bash
# 建置生產版本
npm run build
```

建置完成後，所有靜態檔案會輸出到 `dist/` 目錄。

#### 預覽生產版本

在本地預覽建置後的應用：

使用 **pnpm**：
```bash
pnpm preview
```

使用 **npm**：
```bash
npm run preview
```

預覽伺服器預設會在 `http://localhost:4173` 啟動。

#### 部署到靜態網站託管服務

將 `dist/` 目錄的內容部署到以下服務：

- **Vercel**：直接連接 GitHub 倉庫，自動部署
- **Netlify**：拖放 `dist/` 目錄或連接 Git 倉庫
- **GitHub Pages**：使用 GitHub Actions 自動部署
- **AWS S3 + CloudFront**：上傳 `dist/` 內容到 S3 並配置 CloudFront
- **Nginx / Apache**：將 `dist/` 內容複製到伺服器的網站根目錄

### 🐳 Docker 部署

本專案提供完整的 Docker 支援，使用多階段構建（Multi-stage Build）優化映像大小。

#### 環境需求

- Docker 20.10+
- Docker Compose 2.0+（可選，用於 docker-compose 部署）

#### 方式一：使用 Docker Compose（推薦）

這是最簡單的部署方式：

```bash
# 構建並啟動容器
docker-compose up -d

# 查看容器狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 停止容器
docker-compose down
```

應用程式將在 `http://localhost:3000` 啟動。

#### 方式二：使用 Docker 命令

**構建映像**：
```bash
docker build -t quote-generator:latest .
```

**運行容器**：
```bash
docker run -d \
  --name quote-generator \
  -p 3000:80 \
  --restart unless-stopped \
  quote-generator:latest
```

**查看容器狀態**：
```bash
docker ps
```

**查看日誌**：
```bash
docker logs -f quote-generator
```

**停止並刪除容器**：
```bash
docker stop quote-generator
docker rm quote-generator
```

#### Docker 配置說明

- **多階段構建**：
  - 第一階段：使用 `node:20-alpine` 構建應用
  - 第二階段：使用 `nginx:alpine` 運行靜態檔案

- **端口映射**：
  - 容器內部端口：`80`（Nginx）
  - 主機端口：`3000`（可在 `docker-compose.yml` 中修改）

- **Nginx 配置**：
  - 支援 SPA 路由（所有路由返回 `index.html`）
  - 啟用 Gzip 壓縮
  - 配置靜態資源快取
  - 包含安全標頭設定

#### 自訂配置

**修改端口**：

編輯 `docker-compose.yml`：
```yaml
ports:
  - "8080:80"  # 將主機端口改為 8080
```

**修改 Nginx 配置**：

編輯 `nginx.conf` 後重新構建映像：
```bash
docker-compose build
docker-compose up -d
```

#### 生產環境建議

1. **使用環境變數**：
   - 在 `docker-compose.yml` 中添加環境變數配置
   - 使用 `.env` 檔案管理敏感資訊

2. **使用反向代理**：
   - 在 Docker 容器前配置 Nginx 或 Traefik 作為反向代理
   - 配置 SSL/TLS 憑證（Let's Encrypt）

3. **監控與日誌**：
   - 配置日誌收集（如 ELK Stack）
   - 使用容器監控工具（如 Prometheus + Grafana）

4. **資源限制**：
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

---

## 📖 使用指南

### 基本操作流程

1. **建立報價單**
   - 開啟應用程式後，系統會自動建立一份新的報價單
   - 或從歷史記錄中載入已儲存的報價單

2. **編輯報價單資訊**
   - 填寫報價單基本資訊（編號、日期、有效期限等）
   - 輸入客戶資訊與服務提供方資訊
   - 設定稅率與計算模式（內含/外加/不計算）

3. **新增與管理報價項目**
   - 點擊「新增項目」按鈕新增報價項目
   - 填寫品項名稱、描述、數量、單價
   - 系統會自動計算小計與總金額

4. **拖拽排序**
   - 按住報價項目左側的拖拽圖示
   - 拖動到目標位置後放開，即可調整項目順序

5. **匯出報價單**
   - 點擊頂部的匯出按鈕（JPG / PDF / Excel）
   - 選擇匯出格式後，檔案會自動下載
   - 匯出前系統會自動儲存當前報價單到歷史記錄

6. **管理歷史記錄**
   - 點擊右上角的歷史記錄圖示
   - 查看、載入或刪除已儲存的報價單

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

## 📁 專案結構

```
quote-generator/
├── public/                 # 靜態資源
├── src/
│   ├── assets/            # 圖片、字體等資源
│   ├── components/         # React 組件
│   │   ├── ui/            # shadcn/ui 基礎組件
│   │   ├── ExportButtons.tsx
│   │   ├── HeaderSection.tsx
│   │   ├── HistoryDrawer.tsx
│   │   ├── InfoSection.tsx
│   │   ├── ItemsTable.tsx
│   │   ├── QuotationDisplay.tsx
│   │   └── SummarySection.tsx
│   ├── lib/               # 工具函數庫
│   │   └── utils.ts       # 通用工具函數
│   ├── stores/            # 狀態管理
│   │   └── quotationStore.ts  # Zustand store
│   ├── types/             # TypeScript 類型定義
│   │   └── quotation.ts
│   ├── utils/             # 業務邏輯工具
│   │   ├── calculations.ts    # 計算相關
│   │   ├── exportHandler.ts   # 匯出處理
│   │   └── imageUtils.ts      # 圖片處理
│   ├── App.tsx            # 主應用組件
│   ├── App.css            # 應用樣式
│   ├── index.css          # 全域樣式
│   └── main.tsx           # 應用入口
├── dist/                  # 建置輸出目錄
├── index.html             # HTML 模板
├── package.json           # 專案配置與依賴
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind CSS 配置
└── README.md              # 專案說明文件
```

### 路徑別名

專案使用 `@/` 作為 `src/` 目錄的別名，例如：

```typescript
import { useQuotationStore } from '@/stores/quotationStore';
import { Button } from '@/components/ui/button';
```

---

## 📤 匯出功能說明

### Excel 匯出（ExcelJS）

- **用途**：生成結構化的 `.xlsx` 檔案，適合後續編輯與資料分析
- **注意事項**：
  - 支援樣式設定（字體、顏色、邊框等）
  - 相容 Excel 2007+ 格式
  - 大型檔案可能需要較長處理時間

### PDF 匯出（jsPDF + html2canvas）

- **用途**：將報價單轉換為 PDF 文件，適合正式文件交付
- **注意事項**：
  - 使用 html2canvas 將 DOM 轉換為圖片後再嵌入 PDF
  - 解析度與品質取決於 html2canvas 設定
  - 某些 CSS 樣式可能無法完美還原（如 `backdrop-filter`）
  - 建議在匯出前確認報價單排版是否符合預期
  - 字型嵌入可能需要額外配置

### 圖片匯出（html2canvas）

- **用途**：將報價單轉換為 JPG 圖片，方便快速分享
- **注意事項**：
  - 預設解析度為螢幕解析度，可透過設定調整
  - 跨域資源（如外部圖片）可能無法正確擷取
  - 某些瀏覽器可能對 canvas 大小有限制
  - 建議在現代瀏覽器（Chrome、Firefox、Safari 最新版）中使用

### 瀏覽器相容性

- **建議使用**：Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **不支援**：IE 11 及更舊版本

---

## 🤝 貢獻指南

我們歡迎所有形式的貢獻！以下是參與專案的方式：

### 貢獻流程

1. **Fork 專案**
   - 點擊 GitHub 上的 Fork 按鈕，將專案複製到您的帳號

2. **建立分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **進行修改**
   - 實作新功能或修復問題
   - 確保程式碼符合專案的 ESLint 規範
   - 撰寫或更新相關文件

4. **提交變更**
   ```bash
   git add .
   git commit -m "feat: 新增某項功能"
   ```

5. **推送並建立 Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   - 在 GitHub 上建立 Pull Request
   - 清楚描述您的變更內容與目的

### Commit Message 慣例

建議使用 [Conventional Commits](https://www.conventionalcommits.org/) 風格：

- `feat:` 新功能
- `fix:` 修復問題
- `docs:` 文件更新
- `style:` 程式碼格式調整（不影響功能）
- `refactor:` 程式碼重構
- `test:` 測試相關
- `chore:` 建置流程或工具變更

範例：
```
feat: 新增暗色模式切換功能
fix: 修復拖拽排序在行動裝置上的問題
docs: 更新 README 使用說明
```

---

## 📄 License

本專案採用 MIT License。若您需要使用不同的授權方式，請自行更換 LICENSE 檔案。

---

## ❓ 常見問題

### Q1: 匯出的 PDF 排版與畫面顯示不一致？

**A:** 這可能是因為 html2canvas 在轉換某些 CSS 樣式時的限制。建議：
- 檢查是否有使用 `backdrop-filter`、`clip-path` 等可能不支援的樣式
- 嘗試調整 html2canvas 的 `scale` 參數
- 確認報價單內容在匯出前已完全載入（圖片、字型等）

### Q2: 拖拽功能在行動裝置上無法使用？

**A:** `@dnd-kit` 預設支援觸控操作，但可能需要額外設定。若遇到問題：
- 確認瀏覽器版本是否過舊
- 檢查是否有其他 JavaScript 錯誤影響拖拽功能
- 可考慮在行動裝置上提供替代的排序方式（如上/下箭頭按鈕）

### Q3: 清除瀏覽器資料後，報價單歷史記錄消失了？

**A:** 本專案使用 localStorage 進行資料持久化，清除瀏覽器資料會導致所有本地儲存的資料遺失。這是預期行為：
- 建議定期匯出重要報價單作為備份
- 未來可考慮加入雲端同步功能（需後端支援）
- 若需要長期保存，請將報價單匯出為檔案儲存

### Q4: 如何自訂報價單樣式？

**A:** 報價單樣式主要透過 Tailwind CSS 類別控制：
- 修改 `src/components/QuotationDisplay.tsx` 中的樣式類別
- 調整 `tailwind.config.js` 中的主題設定
- 如需大幅修改，可參考 shadcn/ui 的組件自訂方式

### Q5: 可以匯入現有的報價單嗎？

**A:** 目前版本僅支援從歷史記錄載入已儲存的報價單。若需要匯入外部檔案：
- Excel 匯入功能需要額外實作（解析 Excel 檔案並轉換為 Quotation 格式）
- 可考慮使用 SheetJS 或 ExcelJS 的讀取功能
- 歡迎提交 PR 實作此功能！

---

## 📞 聯絡與回饋

如有問題、建議或發現 Bug，歡迎透過以下方式回報：

- 建立 [GitHub Issue](https://github.com/your-username/quote-generator/issues)
- 提交 Pull Request

感謝您的使用與貢獻！🙏
