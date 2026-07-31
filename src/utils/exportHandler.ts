import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import type { Quotation } from '@/types/quotation';
import { currencyNumFmt } from './formatCurrency';

async function waitForFontsReady(): Promise<void> {
  // 讓字體載入完成再輸出，避免 font metrics 在輸出時改變導致裁切
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fonts = (document as any).fonts as FontFaceSet | undefined;
    if (fonts?.ready) {
      await fonts.ready;
    }
  } catch {
    // ignore
  }
}

function replaceFormControlsWithText(root: HTMLElement, doc: Document): void {
  const view = doc.defaultView;
  if (!view) return;

  const controls = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input, textarea'
  );

  controls.forEach((control) => {
    // 忽略檔案選擇器等不可視控制項
    if (control instanceof HTMLInputElement && control.type === 'file') return;

    const isTextarea = control.tagName === 'TEXTAREA';
    const replacement = doc.createElement(isTextarea ? 'div' : 'span');
    const value = (control as HTMLInputElement | HTMLTextAreaElement).value ?? '';

    replacement.textContent = value;
    // 保留 Tailwind class（維持版面與字級/顏色一致）
    replacement.className = (control as HTMLElement).className;

    const cs = view.getComputedStyle(control);

    // 盡量貼近原本的排版行為
    // 注意：Input 元件預設帶 `flex`，但在匯出時讓文字節點用 inline-block/block 更穩定
    replacement.style.display = isTextarea ? 'block' : 'inline-block';
    // 一律允許換行：單行 input 的長內容（如超長項目名稱）改為折行，
    // 否則會橫向溢出蓋過相鄰欄位
    replacement.style.whiteSpace = 'pre-wrap';
    replacement.style.overflowWrap = 'anywhere';
    replacement.style.wordBreak = 'break-word';
    replacement.style.maxWidth = '100%';
    replacement.style.width = cs.width;
    replacement.style.minHeight = cs.height;
    replacement.style.boxSizing = cs.boxSizing;
    replacement.style.textAlign = cs.textAlign;
    replacement.style.color = cs.color;
    replacement.style.fontFamily = cs.fontFamily;
    replacement.style.fontSize = cs.fontSize;
    replacement.style.fontWeight = cs.fontWeight;
    replacement.style.letterSpacing = cs.letterSpacing;
    replacement.style.lineHeight = cs.lineHeight;
    replacement.style.textTransform = cs.textTransform;

    // 匯出時避免表單 UI 外觀
    replacement.style.border = '0';
    replacement.style.outline = 'none';
    replacement.style.background = 'transparent';
    replacement.style.boxShadow = 'none';

    // 最小幅度補底部空間，專門防 descender 被裁
    replacement.style.paddingBottom = '2px';
    replacement.style.paddingTop = '1px';

    (control as HTMLElement).replaceWith(replacement);
  });
}

// 報價單紙張的固定寬度（px），對應 QuotationDisplay 的 w-[794px]（A4 @ 96dpi）
const PAPER_WIDTH_PX = 794;

async function renderElementToCanvas(
  element: HTMLElement,
  onCloneMeasure?: (clonedRoot: HTMLElement) => void
): Promise<HTMLCanvasElement> {
  await waitForFontsReady();

  const exportId = `export-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const scale = 2;

  // 添加匯出標記
  element.classList.add('export-mode');
  element.dataset.exportId = exportId;

  try {
    // 直接渲染目標元素（不是渲染整個 body 再裁剪）
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      // 虛擬視窗給足寬度，避免紙張（flex 子元素）在窄視窗中被壓縮，
      // 造成匯出排版與螢幕不一致
      windowWidth: Math.max(1280, PAPER_WIDTH_PX),
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedRoot = clonedDoc.querySelector<HTMLElement>(
          `[data-export-id="${exportId}"]`
        );
        if (!clonedRoot) return;

        // 把 input/textarea 轉成純文字節點
        replaceFormControlsWithText(clonedRoot, clonedDoc);

        // 匯出安全樣式
        const style = clonedDoc.createElement('style');
        style.setAttribute('data-export-style', exportId);
        style.textContent = `
          [data-export-id="${exportId}"] {
            width: ${PAPER_WIDTH_PX}px !important;
            flex-shrink: 0 !important;
          }
          [data-export-id="${exportId}"] * {
            -webkit-font-smoothing: antialiased;
            text-rendering: geometricPrecision;
          }
          [data-export-id="${exportId}"] table {
            table-layout: fixed !important;
          }
          [data-export-id="${exportId}"] table td,
          [data-export-id="${exportId}"] table th {
            overflow: visible !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }
          [data-export-id="${exportId}"] td,
          [data-export-id="${exportId}"] th,
          [data-export-id="${exportId}"] span,
          [data-export-id="${exportId}"] p,
          [data-export-id="${exportId}"] div {
            padding-bottom: 2px;
            overflow-wrap: anywhere;
          }
        `;
        clonedDoc.head.appendChild(style);

        // 讓呼叫端在「最終匯出版面」上量測（表單已換成純文字、匯出樣式已套用）
        if (onCloneMeasure) {
          onCloneMeasure(clonedRoot);
        }
      },
    });

    return canvas;
  } finally {
    // 恢復原始狀態
    element.classList.remove('export-mode');
    delete element.dataset.exportId;
  }
}

/**
 * 將元素渲染為圖片 URL
 */
export async function renderToImageUrl(element: HTMLElement): Promise<string> {
  try {
    const canvas = await renderElementToCanvas(element);
    // PNG 無損：文字與細線不會出現 JPEG 壓縮痕
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('渲染圖片失敗:', error);
    throw error;
  }
}

/**
 * 匯出為 PNG 圖片（直接下載）
 */
export async function exportToImage(element: HTMLElement, filename: string = '報價單'): Promise<void> {
  try {
    const url = await renderToImageUrl(element);
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = url;
    link.click();
  } catch (error) {
    console.error('匯出圖片失敗:', error);
    throw error;
  }
}

/**
 * 匯出為 PDF
 */
const PDF_PAGE_MARGIN_MM = 10;
// 切點被移到區塊上緣時，額外留白的安全間距（canvas px，scale=2 下約 6 CSS px）
const PAGE_CUT_PADDING_PX = 12;
// 一頁至少要填到這個比例才允許提前切頁，否則退回硬切（防止超高區塊造成近乎空白頁）
const MIN_PAGE_FILL_RATIO = 0.25;
// 末尾殘片低於此高度（canvas px，約 8mm）就捨棄：那只會是紙張底部的空白邊，
// 有內容的區塊會被切點邏輯整塊推到下一頁，不會留下這麼小的殘尾
const MIN_TAIL_HEIGHT_PX = 60;

interface UnbreakableRange {
  top: number;
  bottom: number;
}

/**
 * 在 html2canvas 的 clone（最終匯出版面）上量測「不可分割區塊」的垂直範圍。
 * 必須在 clone 上量：匯出時表單控制元件已換成純文字、隱藏元素已移除，
 * 版面高度與編輯畫面不同。回傳 CSS px（相對紙張頂端）。
 */
function collectUnbreakableRanges(clonedRoot: HTMLElement): { ranges: UnbreakableRange[]; totalHeight: number } {
  const rootRect = clonedRoot.getBoundingClientRect();
  const nodes = clonedRoot.querySelectorAll<HTMLElement>(
    '[data-export-block], table thead, table tbody tr'
  );
  const ranges: UnbreakableRange[] = [];
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.height <= 0) return;
    ranges.push({
      top: rect.top - rootRect.top,
      bottom: rect.bottom - rootRect.top,
    });
  });
  ranges.sort((a, b) => a.top - b.top);
  return { ranges, totalHeight: rootRect.height };
}

/**
 * 把預定切點往上移到區塊邊界，避免切到半列項目或半行文字。
 * 若區塊比一頁還高（無法避開），退回原切點硬切。
 */
function findSafeCutY(
  desiredY: number,
  sliceStartY: number,
  pageHeightPx: number,
  ranges: UnbreakableRange[]
): number {
  let y = desiredY;
  // 反覆上移：切點可能落入多個（或連鎖的）區塊
  for (let i = 0; i < 20; i++) {
    const straddling = ranges.filter((r) => r.top < y - 1 && r.bottom > y + 1);
    if (straddling.length === 0) break;
    y = Math.min(...straddling.map((r) => r.top)) - PAGE_CUT_PADDING_PX;
  }
  if (y <= sliceStartY + pageHeightPx * MIN_PAGE_FILL_RATIO) {
    return desiredY;
  }
  return y;
}

export async function exportToPDF(element: HTMLElement, filename: string = '報價單'): Promise<void> {
  try {
    // 在渲染 clone 時同步量測區塊位置（clone 即最終匯出版面）
    let cssRanges: UnbreakableRange[] = [];
    let cssHeight = 0;
    const canvas = await renderElementToCanvas(element, (clonedRoot) => {
      const measured = collectUnbreakableRanges(clonedRoot);
      cssRanges = measured.ranges;
      cssHeight = measured.totalHeight;
    });

    // clone CSS px → canvas px
    const yScale = cssHeight > 0 ? canvas.height / cssHeight : 1;
    const ranges: UnbreakableRange[] = cssRanges.map((r) => ({
      top: r.top * yScale,
      bottom: r.bottom * yScale,
    }));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PDF_PAGE_MARGIN_MM * 2;
    const contentHeight = pageHeight - PDF_PAGE_MARGIN_MM * 2;

    // 內容寬度固定貼齊頁面（扣除邊距），高度超過一頁時逐頁切割 canvas，
    // 切點對齊區塊邊界，而不是整張縮小塞進單頁
    const pxPerMm = canvas.width / contentWidth;
    const pageContentHeightPx = Math.floor(contentHeight * pxPerMm);

    let sourceY = 0;
    let page = 0;
    while (sourceY < canvas.height - 1) {
      if (page > 0 && canvas.height - sourceY < MIN_TAIL_HEIGHT_PX) {
        break;
      }
      const desiredEnd = Math.min(sourceY + pageContentHeightPx, canvas.height);
      const end =
        desiredEnd >= canvas.height
          ? canvas.height
          : findSafeCutY(desiredEnd, sourceY, pageContentHeightPx, ranges);
      const sliceHeightPx = Math.round(end - sourceY);

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('無法建立畫布進行 PDF 分頁');
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        canvas,
        0, sourceY, canvas.width, sliceHeightPx,
        0, 0, canvas.width, sliceHeightPx
      );

      if (page > 0) {
        pdf.addPage();
      }
      pdf.addImage(
        sliceCanvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        PDF_PAGE_MARGIN_MM,
        PDF_PAGE_MARGIN_MM,
        contentWidth,
        sliceHeightPx / pxPerMm
      );

      sourceY = end;
      page++;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('匯出 PDF 失敗:', error);
    throw error;
  }
}

/**
 * 匯出為 Excel
 */
export async function exportToExcel(quotation: Quotation, filename: string = '報價單'): Promise<void> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('報價單');
    
    // 設定欄寬
    worksheet.columns = [
      { width: 15 },
      { width: 30 },
      { width: 10 },
      { width: 15 },
      { width: 15 },
    ];
    
    // 標題樣式
    const titleStyle = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
    };
    
    // 表頭樣式
    const headerStyle = {
      font: { bold: true, size: 12 },
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FFE5E7EB' },
      },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        left: { style: 'thin' as const },
        right: { style: 'thin' as const },
      },
    };
    
    // 內容樣式
    const cellStyle = {
      border: {
        top: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        left: { style: 'thin' as const },
        right: { style: 'thin' as const },
      },
    };
    
    let rowIndex = 1;
    
    // 標題
    worksheet.mergeCells(rowIndex, 1, rowIndex, 5);
    worksheet.getCell(rowIndex, 1).value = quotation.title || '報價單';
    worksheet.getCell(rowIndex, 1).style = titleStyle;
    rowIndex += 2;
    
    // 報價單資訊
    worksheet.getCell(rowIndex, 1).value = '報價單編號：';
    worksheet.getCell(rowIndex, 2).value = quotation.quotationNumber;
    rowIndex++;
    worksheet.getCell(rowIndex, 1).value = '報價日期：';
    worksheet.getCell(rowIndex, 2).value = quotation.quotationDate;
    rowIndex++;
    worksheet.getCell(rowIndex, 1).value = '有效日期：';
    worksheet.getCell(rowIndex, 2).value = quotation.validUntil;
    rowIndex += 2;
    
    // 客戶資訊與服務提供方資訊（雙欄）
    const clientRow = rowIndex;
    worksheet.getCell(clientRow, 1).value = '客戶資訊';
    worksheet.getCell(clientRow, 1).style = { font: { bold: true } };
    worksheet.getCell(clientRow, 3).value = '服務提供方';
    worksheet.getCell(clientRow, 3).style = { font: { bold: true } };
    rowIndex++;
    
    worksheet.getCell(rowIndex, 1).value = `公司名稱：${quotation.client.companyName}`;
    worksheet.getCell(rowIndex, 3).value = `公司名稱：${quotation.provider.companyName}`;
    rowIndex++;
    worksheet.getCell(rowIndex, 1).value = `聯絡人：${quotation.client.contactPerson}`;
    worksheet.getCell(rowIndex, 3).value = `聯絡人：${quotation.provider.contactPerson}`;
    rowIndex++;
    worksheet.getCell(rowIndex, 1).value = `電話：${quotation.client.phone}`;
    worksheet.getCell(rowIndex, 3).value = `電話：${quotation.provider.phone}`;
    rowIndex++;
    worksheet.getCell(rowIndex, 1).value = `Email：${quotation.client.email}`;
    worksheet.getCell(rowIndex, 3).value = `Email：${quotation.provider.email}`;
    rowIndex++;
    worksheet.getCell(rowIndex, 1).value = `地址：${quotation.client.address}`;
    worksheet.getCell(rowIndex, 3).value = `地址：${quotation.provider.address}`;
    rowIndex++;
    worksheet.getCell(rowIndex, 1).value = `統一編號：${quotation.client.taxId || ''}`;
    worksheet.getCell(rowIndex, 3).value = `統一編號：${quotation.provider.taxId || ''}`;
    rowIndex += 2;
    
    // Logo 嵌入（服務提供方）
    if (quotation.provider.logo) {
      try {
        // 判斷圖片格式
        let extension: 'png' | 'jpeg' | 'gif' = 'png';
        if (quotation.provider.logo.includes('data:image/jpeg') || quotation.provider.logo.includes('data:image/jpg')) {
          extension = 'jpeg';
        } else if (quotation.provider.logo.includes('data:image/gif')) {
          extension = 'gif';
        }
        
        // 提取 base64 數據（移除 data URL 前綴）
        const base64Data = quotation.provider.logo.split(',')[1] || quotation.provider.logo;
        
        const imageId = workbook.addImage({
          base64: base64Data,
          extension: extension,
        });
        
        worksheet.addImage(imageId, {
          tl: { col: 3, row: clientRow - 1 },
          ext: { width: 100, height: 100 },
        });
      } catch (error) {
        console.warn('嵌入 Logo 失敗:', error);
      }
    }
    
    // 報價項目表頭
    worksheet.getCell(rowIndex, 1).value = '項目名稱';
    worksheet.getCell(rowIndex, 1).style = headerStyle;
    worksheet.getCell(rowIndex, 2).value = '規格/描述';
    worksheet.getCell(rowIndex, 2).style = headerStyle;
    worksheet.getCell(rowIndex, 3).value = '數量';
    worksheet.getCell(rowIndex, 3).style = headerStyle;
    worksheet.getCell(rowIndex, 4).value = '單價';
    worksheet.getCell(rowIndex, 4).style = headerStyle;
    worksheet.getCell(rowIndex, 5).value = '小計';
    worksheet.getCell(rowIndex, 5).style = headerStyle;
    rowIndex++;
    
    // 報價項目內容
    const amountNumFmt = currencyNumFmt(quotation.showDecimals === true);
    quotation.items.forEach((item) => {
      worksheet.getCell(rowIndex, 1).value = item.name;
      worksheet.getCell(rowIndex, 1).style = cellStyle;
      worksheet.getCell(rowIndex, 2).value = item.description;
      worksheet.getCell(rowIndex, 2).style = cellStyle;
      worksheet.getCell(rowIndex, 3).value = item.quantity;
      worksheet.getCell(rowIndex, 3).style = { ...cellStyle, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 4).value = item.unitPrice;
      worksheet.getCell(rowIndex, 4).style = { ...cellStyle, alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
      worksheet.getCell(rowIndex, 5).value = item.subtotal;
      worksheet.getCell(rowIndex, 5).style = { ...cellStyle, alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
      rowIndex++;
    });
    
    // 總計（使用新的計算邏輯）
    const { calculateSubtotal, calculateSubtotalAfterTax, calculateTax, calculateTotal } = await import('./calculations');
    const subtotal = calculateSubtotal(quotation.items);
    const subtotalAfterTax = calculateSubtotalAfterTax(subtotal, quotation.taxConfig);
    const tax = calculateTax(subtotal, quotation.taxConfig);
    const total = calculateTotal(subtotal, quotation.taxConfig);
    
    // 根據計算模式顯示不同的金額
    const taxMode = quotation.taxConfig.mode || 'excluded'; // 相容舊資料
    if (taxMode === 'included') {
      // 內含模式
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '含稅總額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = subtotal;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '未稅金額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = subtotalAfterTax;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = `${quotation.taxConfig.name} (${quotation.taxConfig.rate}%)：`;
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = tax;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
    } else if (taxMode === 'excluded') {
      // 外加模式
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '未稅金額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = subtotal;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = `${quotation.taxConfig.name} (${quotation.taxConfig.rate}%)：`;
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = tax;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '含稅總額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = total;
      worksheet.getCell(rowIndex, 5).style = { font: { bold: true }, alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
    } else {
      // 不計算模式
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '總額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = total;
      worksheet.getCell(rowIndex, 5).style = { font: { bold: true }, alignment: { horizontal: 'right' as const }, numFmt: amountNumFmt };
    }
    
    // 備註
    if (quotation.notes) {
      rowIndex += 2;
      worksheet.getCell(rowIndex, 1).value = '備註：';
      worksheet.getCell(rowIndex, 1).style = { font: { bold: true } };
      rowIndex++;
      worksheet.mergeCells(rowIndex, 1, rowIndex, 5);
      worksheet.getCell(rowIndex, 1).value = quotation.notes;
    }
    
    // 下載
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('匯出 Excel 失敗:', error);
    throw error;
  }
}

