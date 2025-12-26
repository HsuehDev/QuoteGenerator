# AI 開發指南

> 本指南專為 AI 助手設計，用於後續開發報價單產生器專案。請在進行任何開發工作前仔細閱讀本指南。

## 目錄

1. [專案概述](#專案概述)
2. [排版規範（防止文字裁切）](#排版規範防止文字裁切)
3. [匯出功能開發](#匯出功能開發)
4. [組件開發規範](#組件開發規範)
5. [狀態管理（Zustand）](#狀態管理zustand)
6. [樣式系統](#樣式系統)
7. [常見問題和解決方案](#常見問題和解決方案)
8. [測試指南](#測試指南)
9. [開發檢查清單](#開發檢查清單)
10. [參考資源](#參考資源)

---

## 專案概述

### 技術棧

- **前端框架**：React 19.2.0 + TypeScript 5.9.3
- **建置工具**：Vite 7.2.4
- **樣式系統**：Tailwind CSS 3.4.19
- **狀態管理**：Zustand 5.0.9
- **UI 組件庫**：shadcn/ui (Radix UI)
- **匯出功能**：
  - `html2canvas` 1.4.1 - HTML → Canvas 轉換
  - `jspdf` 3.0.4 - PDF 生成
  - `exceljs` 4.4.0 - Excel 生成

### 核心功能

報價單產生器，支援：
- 即時編輯報價單內容
- 匯出為 JPG 圖片
- 匯出為 PDF 文件
- 匯出為 Excel 試算表
- 歷史記錄管理（最多保留 5 筆）

### 專案結構

```
src/
├── components/          # React 組件
│   ├── ui/             # shadcn/ui 基礎組件
│   ├── QuotationDisplay.tsx    # 主要報價單顯示組件
│   ├── ExportButtons.tsx       # 匯出按鈕組件
│   └── ...
├── stores/             # Zustand 狀態管理
│   └── quotationStore.ts
├── types/              # TypeScript 類型定義
│   └── quotation.ts
├── utils/              # 工具函數
│   ├── exportHandler.ts        # 匯出功能核心
│   ├── calculations.ts          # 金額計算邏輯
│   └── imageUtils.ts            # 圖片處理
├── lib/                # 共用函數庫
│   └── utils.ts        # Tailwind class 合併工具
├── index.css           # 全域樣式和排版規範
└── App.tsx             # 應用程式入口
```

### 關鍵依賴說明

- **zustand/middleware/persist**：自動將狀態持久化到 localStorage
- **date-fns**：日期格式化（使用 zhTW locale）
- **lucide-react**：圖示庫
- **@dnd-kit**：拖曳排序功能

---

## 排版規範（防止文字裁切）

### 問題背景

本專案曾發生嚴重的文字下緣（descender）被裁切問題，特別是在匯出 PDF/圖片時。常見被裁切的字元包括：
- **數字**：9, 8, 7, 6
- **英文**：g, y, p, q, j
- **中文**：部分下緣筆畫

**根本原因**：
1. `html2canvas` 對 font metrics 的計算與瀏覽器略有差異
2. 表單控制項（input/textarea）在 canvas 渲染時容易出現 metrics 問題
3. line-height 不足或 overflow hidden 導致容器裁切

### 核心原則

1. **所有文字元素必須使用安全的 line-height（≥ 1.4）**
2. **避免危險的組合**：
   - `leading-tight` (line-height: 1.25)
   - `leading-none` (line-height: 1)
   - `h-auto` + `p-0` 組合
   - `overflow: hidden` 在文字容器上
3. **表格 cell 必須使用專用 class**

### 可用的 Typography Classes

#### 基礎文字類別

```css
.invoice-text          /* 一般文字（12-14px）*/
.invoice-text-xs      /* 小字（9px）*/
.invoice-text-sm      /* 小字（10-11px）*/
```

#### 數字/金額類別

```css
.invoice-number       /* 一般數字/金額（font-mono）*/
.invoice-amount-large /* 大字號金額（如應付總額）*/
```

#### 表格 Cell 類別

```css
.invoice-cell         /* 一般表格 cell */
.invoice-cell-sm      /* 小表格 cell（表頭等）*/
```

### Tailwind Line-Height Tokens

在 `tailwind.config.js` 中定義了專用的 line-height tokens：

```javascript
lineHeight: {
  'invoice-xs': '1.5',     // 9px 字級
  'invoice-sm': '1.45',    // 10-11px 字級
  'invoice-base': '1.4',   // 12-14px 字級
  'invoice-lg': '1.35',    // 16px+ 字級
  'invoice-xl': '1.3',     // 20px+ 字級
}
```

使用方式：`leading-invoice-base`, `leading-invoice-xs` 等

### 程式碼範例

#### ✅ 正確寫法

```tsx
// 一般文字
<Input
  value={item.name}
  className="text-sm invoice-text leading-invoice-base export-hide-border"
/>

// 小字標籤
<span className="text-[9px] invoice-text-xs">文件編號</span>

// 數字/金額
<span className="font-mono invoice-number">
  NT$ {amount.toLocaleString()}
</span>

// 大字號金額
<div className="text-xl font-mono invoice-amount-large">
  NT$ {total.toLocaleString()}
</div>

// 表格 cell
<td className="invoice-cell">
  <Input className="invoice-text" />
</td>
```

#### ❌ 錯誤寫法

```tsx
// ❌ 使用 leading-tight（line-height 太小）
<Input className="text-sm leading-tight" />

// ❌ 使用 leading-none（無法容納 descender）
<span className="text-[9px] leading-none">標籤</span>

// ❌ h-auto + p-0 組合（容器高度不足）
<Input className="h-auto p-0" />

// ❌ 表格 cell 沒有使用專用 class
<td className="py-4">
  <span>內容</span>
</td>

// ❌ 數字沒有使用 invoice-number
<span className="font-mono">NT$ 7,188</span>
```

### 參考檔案

- [src/index.css](src/index.css) - 排版規範 CSS 定義
- [tailwind.config.js](tailwind.config.js) - Tailwind tokens 配置
- [src/components/QuotationDisplay.tsx](src/components/QuotationDisplay.tsx) - 實際應用範例

---

## 匯出功能開發

### 核心機制

匯出功能位於 [src/utils/exportHandler.ts](src/utils/exportHandler.ts)，使用 `html2canvas` 將 HTML 轉換為 Canvas，再轉為圖片或 PDF。

#### 關鍵流程

1. **等待字體載入**：`waitForFontsReady()` 確保字體完全載入
2. **添加匯出模式**：為元素添加 `.export-mode` class
3. **HTML → Canvas 轉換**：
   - 在 `onclone` 階段將所有 `input/textarea` 轉換為純文字節點
   - 應用匯出安全樣式
   - 嘗試 `foreignObjectRendering: true`（通常能解決裁切問題）
   - 若結果為空白，自動 fallback 到標準渲染模式
4. **Canvas → 輸出格式**：轉換為 JPG/PDF

### 匯出模式樣式

#### `.export-mode` class

當元素添加此 class 時，會觸發以下樣式：

```css
.export-mode .export-hide {
  display: none !important;  /* 隱藏編輯 UI */
}

.export-mode .export-hide-border {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  /* 移除表單邊框，但保留內容 */
}
```

#### 使用方式

```tsx
// 在匯出前添加
element.classList.add('export-mode');

// 匯出完成後移除
element.classList.remove('export-mode');
```

### 表單元素轉換機制

**為什麼需要轉換？**

`input/textarea` 在 `html2canvas` 渲染時容易出現 font metrics 問題，導致文字下緣被裁切。解決方案是在 `onclone` 階段將它們轉換為純文字節點。

**實作細節**（見 `replaceFormControlsWithText` 函數）：

1. 找到所有 `input` 和 `textarea`（排除 `type="file"`）
2. 建立對應的 `span` 或 `div` 元素
3. 複製所有 Tailwind classes（維持樣式）
4. 複製所有關鍵 CSS 屬性（font-size, line-height, color 等）
5. 添加安全 padding（`padding-bottom: 2px`, `padding-top: 1px`）
6. 替換原始元素

### 自動 Fallback 機制

**問題**：`foreignObjectRendering: true` 在某些瀏覽器（特別是 Safari）會渲染成空白畫面。

**解決方案**：

```typescript
// 先嘗試 foreignObjectRendering
const foCanvas = await renderWithHtml2Canvas(element, exportId, true);

// 檢查是否為空白
if (!isCanvasProbablyBlank(foCanvas)) {
  return foCanvas;  // 成功，直接返回
}

// Fallback：使用標準渲染
return await renderWithHtml2Canvas(element, exportId, false);
```

### 開發新匯出功能時的注意事項

#### 1. 必須等待字體載入

```typescript
await waitForFontsReady();
```

#### 2. 必須處理表單元素轉換

在 `html2canvas` 的 `onclone` 回調中：

```typescript
onclone: (clonedDoc) => {
  const clonedRoot = clonedDoc.querySelector('[data-export-id="..."]');
  if (clonedRoot) {
    replaceFormControlsWithText(clonedRoot, clonedDoc);
  }
}
```

#### 3. 必須實現 Fallback 機制

```typescript
try {
  // 嘗試 foreignObjectRendering
  const canvas = await html2canvas(element, {
    foreignObjectRendering: true,
    // ...
  });
  
  if (isCanvasProbablyBlank(canvas)) {
    // Fallback
    return await html2canvas(element, {
      foreignObjectRendering: false,
      // ...
    });
  }
  
  return canvas;
} catch (error) {
  // 錯誤處理
}
```

#### 4. 必須添加匯出模式 class

```typescript
element.classList.add('export-mode');
try {
  // 匯出邏輯
} finally {
  element.classList.remove('export-mode');
}
```

### 參考檔案

- [src/utils/exportHandler.ts](src/utils/exportHandler.ts) - 匯出功能完整實作

---

## 組件開發規範

### 組件結構

#### 檔案位置

- **業務組件**：`src/components/`（如 `QuotationDisplay.tsx`）
- **UI 基礎組件**：`src/components/ui/`（shadcn/ui 組件）

#### 組件範本

```tsx
import { useQuotationStore } from '@/stores/quotationStore';
import { Input } from '@/components/ui/input';

export function MyComponent() {
  const { currentQuotation, updateQuotation } = useQuotationStore();
  
  if (!currentQuotation) return null;
  
  return (
    <div className="...">
      {/* 組件內容 */}
    </div>
  );
}
```

### 命名規範

- **組件檔案**：PascalCase（如 `QuotationDisplay.tsx`）
- **導出函數**：PascalCase（如 `export function QuotationDisplay()`）
- **內部變數**：camelCase
- **常數**：UPPER_SNAKE_CASE

### 樣式規範

#### Tailwind CSS 使用

- 使用 utility classes，避免自訂 CSS
- 響應式設計：使用 `md:`, `lg:` 前綴
- 列印/匯出樣式：使用 `print:`, `.export-mode` 前綴

```tsx
<div className="
  text-sm                    // 基礎樣式
  md:text-base               // 響應式
  print:text-lg              // 列印樣式
  export-mode:text-base      // 匯出樣式（需配合 JS）
">
```

#### 匯出相關 Class

- **`.export-hide`**：匯出時隱藏（用於編輯按鈕等）
- **`.export-hide-border`**：匯出時移除邊框（用於 Input/Textarea）

```tsx
<Button className="export-hide">
  編輯
</Button>

<Input
  className="export-hide-border invoice-text"
  value={value}
/>
```

### 表單元素規範

#### Input/Textarea 必須：

1. **添加 `export-hide-border` class**（匯出時移除邊框）
2. **添加適當的 typography class**（防止裁切）
3. **使用 `h-auto`**（避免固定高度）

```tsx
// ✅ 正確
<Input
  value={value}
  className="
    export-hide-border
    invoice-text
    leading-invoice-base
    h-auto
    p-0
  "
/>

// ❌ 錯誤
<Input
  value={value}
  className="h-10"  // 固定高度
/>
```

#### 數字/金額顯示

必須使用 `invoice-number` 或 `invoice-amount-large`：

```tsx
// ✅ 正確
<span className="font-mono invoice-number">
  NT$ {amount.toLocaleString()}
</span>

<div className="text-xl font-mono invoice-amount-large">
  NT$ {total.toLocaleString()}
</div>
```

### TypeScript 規範

#### 類型定義

- 使用 `interface` 定義物件類型
- 使用 `type` 定義聯合類型或別名
- 所有 props 必須有類型

```tsx
interface MyComponentProps {
  title: string;
  optional?: number;
}

export function MyComponent({ title, optional }: MyComponentProps) {
  // ...
}
```

#### 引用類型

從 `@/types/quotation` 引用共用類型：

```tsx
import type { Quotation, LineItem } from '@/types/quotation';
```

### 參考檔案

- [src/components/QuotationDisplay.tsx](src/components/QuotationDisplay.tsx) - 完整組件範例

---

## 狀態管理（Zustand）

### Store 結構

Store 位於 [src/stores/quotationStore.ts](src/stores/quotationStore.ts)，使用 Zustand + persist middleware。

### 核心概念

#### 狀態結構

```typescript
interface QuotationStore {
  currentQuotation: Quotation | null;  // 當前編輯的報價單
  history: Quotation[];                 // 歷史記錄（最多 5 筆）
  
  // Actions
  createQuotation: () => void;
  updateQuotation: (updates: Partial<Quotation>) => void;
  // ...
}
```

#### 持久化

使用 `zustand/middleware/persist` 自動將狀態保存到 `localStorage`：

```typescript
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'quotation-storage',
    partialize: (state) => ({
      currentQuotation: state.currentQuotation,
      history: state.history,
    },
  }
)
```

### 主要 Actions

#### 報價單操作

- `createQuotation()` - 建立新報價單
- `updateQuotation(updates)` - 更新報價單基本資訊
- `loadQuotation(id)` - 載入歷史報價單
- `deleteQuotation(id)` - 刪除歷史記錄
- `saveToHistory()` - 儲存當前報價單到歷史

#### 客戶/提供方資訊

- `updateClientInfo(client)` - 更新客戶資訊
- `updateProviderInfo(provider)` - 更新服務提供方資訊

#### 報價項目操作

- `addLineItem()` - 新增報價項目
- `updateLineItem(id, updates)` - 更新報價項目（自動計算小計）
- `deleteLineItem(id)` - 刪除報價項目
- `reorderItems(startIndex, endIndex)` - 重新排序項目

#### 其他

- `updateTaxConfig(taxConfig)` - 更新稅率設定
- `updateNotes(notes)` - 更新備註

### 使用範例

```tsx
import { useQuotationStore } from '@/stores/quotationStore';

export function MyComponent() {
  // 取得狀態和 actions
  const {
    currentQuotation,
    updateQuotation,
    updateLineItem,
    addLineItem,
  } = useQuotationStore();
  
  // 檢查是否有當前報價單
  if (!currentQuotation) return null;
  
  // 更新報價單標題
  const handleTitleChange = (title: string) => {
    updateQuotation({ title });
  };
  
  // 更新報價項目
  const handleItemUpdate = (id: string, name: string) => {
    updateLineItem(id, { name });
    // 注意：小計會自動計算
  };
  
  return (
    <div>
      <Input
        value={currentQuotation.title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />
    </div>
  );
}
```

### 類型定義

所有類型定義在 [src/types/quotation.ts](src/types/quotation.ts)：

- `Quotation` - 報價單完整資料結構
- `LineItem` - 報價項目
- `ClientInfo` - 客戶資訊
- `ProviderInfo` - 服務提供方資訊
- `TaxConfig` - 稅率設定
- `TaxCalculationMode` - 稅率計算模式（'included' | 'excluded' | 'none'）

### 參考檔案

- [src/stores/quotationStore.ts](src/stores/quotationStore.ts) - Store 完整實作
- [src/types/quotation.ts](src/types/quotation.ts) - 類型定義

---

## 樣式系統

### Tailwind 配置

配置檔案：[tailwind.config.js](tailwind.config.js)

#### 自訂 Tokens

```javascript
lineHeight: {
  'invoice-xs': '1.5',
  'invoice-sm': '1.45',
  'invoice-base': '1.4',
  'invoice-lg': '1.35',
  'invoice-xl': '1.3',
}
```

### 自訂 CSS

主要樣式定義在 [src/index.css](src/index.css)：

#### CSS 變數

```css
:root {
  --line-height-xs: 1.5;
  --line-height-sm: 1.45;
  --line-height-base: 1.4;
  --line-height-lg: 1.35;
  --line-height-xl: 1.3;
  
  --cell-padding-y-safe: 0.75rem;
  --cell-padding-bottom-extra: 3px;
}
```

#### Typography Classes

所有 typography classes 都在 `src/index.css` 中定義，請參考[排版規範](#排版規範防止文字裁切)章節。

### 響應式斷點

使用 Tailwind 預設斷點：

- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

### 列印樣式

使用 `@media print` 定義列印專用樣式：

```css
@media print {
  input,
  textarea {
    height: auto !important;
    line-height: 1.5 !important;
  }
  
  table td,
  table th {
    overflow: visible !important;
  }
}
```

### 參考檔案

- [src/index.css](src/index.css) - 完整樣式定義
- [tailwind.config.js](tailwind.config.js) - Tailwind 配置

---

## 常見問題和解決方案

### 問題 1：匯出結果是空白畫面

**症狀**：點擊匯出按鈕後，產生的 PDF/JPG 是完全空白的。

**原因**：
- `foreignObjectRendering: true` 在某些瀏覽器（特別是 Safari）會失敗
- 字體尚未載入完成

**解決方案**：
- ✅ 已實作自動 fallback 機制（見 [匯出功能開發](#匯出功能開發)）
- ✅ 已實作 `waitForFontsReady()` 等待字體載入

**如果問題仍存在**：
檢查 `isCanvasProbablyBlank()` 函數的判斷邏輯是否過於嚴格。

### 問題 2：文字下緣被裁切

**症狀**：匯出的 PDF/JPG 中，數字 9/8/7/6 或字母 g/y/p/q 的下緣被切掉。

**原因**：
- line-height 不足
- 使用 `leading-tight` 或 `leading-none`
- 表格 cell 沒有使用專用 class
- `overflow: hidden` 裁切了文字

**解決方案**：
1. ✅ 使用專用 typography classes（`.invoice-text`, `.invoice-number` 等）
2. ✅ 表格 cell 使用 `.invoice-cell` 或 `.invoice-cell-sm`
3. ✅ 避免 `overflow: hidden` 在文字容器上
4. ✅ 匯出時會自動轉換表單元素為純文字

**檢查清單**：
- [ ] 所有文字元素都有適當的 typography class
- [ ] line-height ≥ 1.4
- [ ] 沒有使用 `leading-tight` 或 `leading-none`
- [ ] 表格 cell 使用 `.invoice-cell`
- [ ] 數字/金額使用 `.invoice-number` 或 `.invoice-amount-large`

### 問題 3：版面在匯出時跑版

**症狀**：瀏覽器預覽正常，但匯出後版面錯亂。

**原因**：
- `.export-mode` class 未正確添加
- 匯出模式樣式未正確套用
- 表單元素轉換時樣式遺失

**解決方案**：
1. 確認匯出前有添加 `.export-mode` class
2. 確認所有需要隱藏的元素有 `.export-hide` class
3. 確認表單元素有 `.export-hide-border` class
4. 檢查 `replaceFormControlsWithText` 是否正確複製了樣式

### 問題 4：歷史記錄未保存

**症狀**：關閉瀏覽器後，歷史記錄消失。

**原因**：
- localStorage 被清除
- persist middleware 配置錯誤

**解決方案**：
- ✅ 已正確配置 persist middleware
- 檢查瀏覽器是否允許 localStorage
- 檢查是否有其他程式清除 localStorage

### 問題 5：金額計算錯誤

**症狀**：稅額或總額計算不正確。

**原因**：
- 稅率計算模式（included/excluded/none）理解錯誤
- 計算邏輯錯誤

**解決方案**：
- 參考 [src/utils/calculations.ts](src/utils/calculations.ts) 的計算邏輯
- 確認 `taxConfig.mode` 設定正確：
  - `'included'` - 稅額已內含在總額中
  - `'excluded'` - 稅額外加在未稅金額上
  - `'none'` - 不計算稅額

---

## 測試指南

### 排版測試

#### 測試字串

在報價單中輸入以下測試字串，確認不會被裁切：

1. **數字測試**：`9876543210`
2. **英文測試**：`gyqpj GYQPJ`
3. **中文測試**：`專案報價單項目計算金額總計`
4. **混合測試**：`NT$ 7,188` / `NT$ 3,998`

#### 測試場景

必須在以下所有場景中測試：

1. **瀏覽器預覽**
   - 檢查所有文字下緣是否完整顯示
   - 特別注意表格中的數字和金額區域

2. **列印預覽**（Chrome → Ctrl/Cmd+P）
   - 檢查列印預覽中的文字是否完整
   - 確認沒有裁切

3. **PDF 輸出**
   - 點擊「匯出 PDF」
   - 打開 PDF 檔案，放大檢查文字下緣
   - 特別檢查數字 9, 8, 7, 6

4. **圖片輸出**（JPG）
   - 點擊「匯出 JPG」
   - 打開圖片檔案，放大檢查
   - 確認所有 descender 都完整

#### 重點檢查區域

1. **表格數字欄位**
   - 數量欄位
   - 單價欄位
   - 小計欄位

2. **金額摘要區**
   - 未稅合計
   - 稅額
   - 應付總額（特別是大字號金額）

3. **小字區域**
   - 文件編號
   - 日期
   - 備註條款標題
   - 頁尾文字

### 功能測試

#### 報價單操作

- [ ] 建立新報價單
- [ ] 編輯報價單標題和編號
- [ ] 更新客戶資訊
- [ ] 更新服務提供方資訊
- [ ] 上傳 Logo

#### 報價項目操作

- [ ] 新增報價項目
- [ ] 編輯項目名稱和描述
- [ ] 修改數量和單價（確認小計自動計算）
- [ ] 刪除報價項目
- [ ] 拖曳排序項目

#### 稅率設定

- [ ] 切換稅率計算模式（內含/外加/不計算）
- [ ] 修改稅目名稱和稅率
- [ ] 確認金額計算正確

#### 匯出功能

- [ ] 匯出 JPG（檢查是否空白、文字是否裁切）
- [ ] 匯出 PDF（檢查是否空白、文字是否裁切）
- [ ] 匯出 Excel（檢查資料是否正確）

#### 歷史記錄

- [ ] 儲存報價單到歷史
- [ ] 載入歷史報價單
- [ ] 刪除歷史記錄
- [ ] 確認最多保留 5 筆

---

## 開發檢查清單

### 新增文字元素時

- [ ] 使用適當的 typography class（`.invoice-text`, `.invoice-text-xs`, `.invoice-text-sm`）
- [ ] line-height ≥ 1.4（使用 `leading-invoice-*` tokens）
- [ ] 避免 `overflow: hidden` 在文字容器上
- [ ] 數字/金額使用 `.invoice-number` 或 `.invoice-amount-large`
- [ ] 在輸出時測試是否裁切

### 新增表格時

- [ ] 表格 cell 使用 `.invoice-cell` 或 `.invoice-cell-sm`
- [ ] 表頭使用 `.invoice-cell-sm` + `.invoice-text-xs`
- [ ] 確認 `overflow: visible`（匯出時會自動套用）

### 新增表單元素時

- [ ] Input/Textarea 添加 `.export-hide-border` class
- [ ] 添加適當的 typography class
- [ ] 使用 `h-auto` 避免固定高度
- [ ] 確認匯出時能正確轉換為純文字

### 新增匯出功能時

- [ ] 等待 `document.fonts.ready`
- [ ] 在 `onclone` 階段處理表單元素轉換
- [ ] 實現 fallback 機制（foreignObjectRendering → 標準渲染）
- [ ] 添加 `.export-mode` class
- [ ] 測試所有輸出格式（JPG/PDF）
- [ ] 測試空白 canvas 的 fallback

### 新增組件時

- [ ] 遵循命名規範（PascalCase）
- [ ] 使用 TypeScript 類型
- [ ] 添加適當的樣式 class
- [ ] 使用 Zustand store 管理狀態
- [ ] 處理 `currentQuotation` 為 null 的情況

### 修改樣式時

- [ ] 優先使用 Tailwind utility classes
- [ ] 如需自訂 CSS，添加到 `src/index.css`
- [ ] 確認響應式設計（`md:`, `lg:` 前綴）
- [ ] 確認列印/匯出樣式（`print:`, `.export-mode`）
- [ ] 測試所有斷點和輸出格式

---

## 參考資源

### 專案相關文檔

- [TYPOGRAPHY_FIX.md](TYPOGRAPHY_FIX.md) - 文字裁切問題修復說明
- [README.md](README.md) - 專案基本說明

### 外部資源

#### CSS 和排版

- [MDN - line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)
- [Font Metrics and line-height](https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)

#### 匯出相關

- [html2canvas 文檔](https://html2canvas.hertzen.com/)
- [jsPDF 文檔](https://github.com/parallax/jsPDF)
- [ExcelJS 文檔](https://github.com/exceljs/exceljs)

#### React 和 TypeScript

- [React 文檔](https://react.dev/)
- [TypeScript 手冊](https://www.typescriptlang.org/docs/)
- [Zustand 文檔](https://docs.pmnd.rs/zustand)

#### UI 組件

- [shadcn/ui 文檔](https://ui.shadcn.com/)
- [Radix UI 文檔](https://www.radix-ui.com/)

---

## 結語

本指南涵蓋了報價單產生器專案的所有關鍵開發規範。在進行任何開發工作前，請務必：

1. **閱讀相關章節**：根據你要開發的功能，閱讀對應的章節
2. **遵循規範**：特別是排版規範和匯出功能規範，這些是避免問題的關鍵
3. **參考範例**：查看實際的程式碼範例，了解正確的寫法
4. **進行測試**：完成開發後，務必進行完整的測試

如有任何問題或需要補充的內容，請更新本指南。

---

**最後更新**：2024-12-26  
**版本**：1.0.0

