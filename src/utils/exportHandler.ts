import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import type { Quotation } from '@/types/quotation';

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
    replacement.style.whiteSpace = isTextarea ? 'pre-wrap' : 'pre';
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

function isCanvasProbablyBlank(canvas: HTMLCanvasElement): boolean {
  const w = canvas.width;
  const h = canvas.height;
  if (w === 0 || h === 0) return true;

  // 把畫面縮到小尺寸再取樣，避免讀大張 imageData 造成效能/記憶體問題
  const sampleW = 64;
  const sampleH = 64;
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = sampleW;
  sampleCanvas.height = sampleH;
  const sctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!sctx) return true;

  sctx.drawImage(canvas, 0, 0, sampleW, sampleH);
  const data = sctx.getImageData(0, 0, sampleW, sampleH).data;

  let nonWhite = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] ?? 0;
    if (a < 10) continue;
    const r = data[i] ?? 255;
    const g = data[i + 1] ?? 255;
    const b = data[i + 2] ?? 255;
    // 只要不是接近白底，就視為有內容（文字/線條通常會落在這裡）
    if (r < 250 || g < 250 || b < 250) nonWhite++;
  }

  // 64*64=4096 pixels，若幾乎全白，很可能是 foreignObjectRendering 失敗的空白畫面
  return nonWhite < 8;
}

async function renderWithHtml2Canvas(
  element: HTMLElement,
  exportId: string,
  foreignObjectRendering: boolean
): Promise<HTMLCanvasElement> {
  return await html2canvas(element, {
    scale: 2, // 高解析度
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    allowTaint: true,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    letterRendering: true,
    foreignObjectRendering,
    onclone: (clonedDoc) => {
      const clonedRoot = clonedDoc.querySelector<HTMLElement>(
        `[data-export-id="${exportId}"]`
      );
      if (!clonedRoot) return;

      // 把 input/textarea 轉成純文字節點，避免表單控制項在 canvas 渲染時出現 metrics 裁切
      replaceFormControlsWithText(clonedRoot, clonedDoc);

      // 匯出安全樣式（只作用在本次匯出 DOM）
      const style = clonedDoc.createElement('style');
      style.setAttribute('data-export-style', exportId);
      style.textContent = `
        [data-export-id="${exportId}"] * {
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
        }
        [data-export-id="${exportId}"] table td,
        [data-export-id="${exportId}"] table th {
          overflow: visible !important;
        }
        /* 多預留一點點底部空間，避免任何字體 descender 被裁 */
        [data-export-id="${exportId}"] td,
        [data-export-id="${exportId}"] th,
        [data-export-id="${exportId}"] span,
        [data-export-id="${exportId}"] p,
        [data-export-id="${exportId}"] div {
          padding-bottom: 2px;
        }
      `;
      clonedDoc.head.appendChild(style);
    },
  });
}

async function renderElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForFontsReady();

  const exportId = `export-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  element.dataset.exportId = exportId;

  try {
    // 添加匯出模式 class，隱藏編輯 UI
    element.classList.add('export-mode');

    // 先嘗試 foreignObjectRendering（通常能解決字型裁切），但在部分瀏覽器會渲染成空白
    const foCanvas = await renderWithHtml2Canvas(element, exportId, true);
    if (!isCanvasProbablyBlank(foCanvas)) return foCanvas;

    // fallback：若 foreignObjectRendering 產生空白，改用一般模式
    return await renderWithHtml2Canvas(element, exportId, false);
  } finally {
    element.classList.remove('export-mode');
    delete element.dataset.exportId;
  }
}

/**
 * 匯出為 JPG 圖片
 */
export async function exportToImage(element: HTMLElement, filename: string = '報價單'): Promise<void> {
  try {
    const canvas = await renderElementToCanvas(element);
    
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `${filename}.jpg`;
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
export async function exportToPDF(element: HTMLElement, filename: string = '報價單'): Promise<void> {
  try {
    const canvas = await renderElementToCanvas(element);
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
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
    quotation.items.forEach((item) => {
      worksheet.getCell(rowIndex, 1).value = item.name;
      worksheet.getCell(rowIndex, 1).style = cellStyle;
      worksheet.getCell(rowIndex, 2).value = item.description;
      worksheet.getCell(rowIndex, 2).style = cellStyle;
      worksheet.getCell(rowIndex, 3).value = item.quantity;
      worksheet.getCell(rowIndex, 3).style = { ...cellStyle, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 4).value = item.unitPrice;
      worksheet.getCell(rowIndex, 4).style = { ...cellStyle, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = item.subtotal;
      worksheet.getCell(rowIndex, 5).style = { ...cellStyle, alignment: { horizontal: 'right' as const } };
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
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const } };
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '未稅金額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = subtotalAfterTax;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const } };
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = `${quotation.taxConfig.name} (${quotation.taxConfig.rate}%)：`;
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = tax;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const } };
    } else if (taxMode === 'excluded') {
      // 外加模式
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '未稅金額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = subtotal;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const } };
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = `${quotation.taxConfig.name} (${quotation.taxConfig.rate}%)：`;
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = tax;
      worksheet.getCell(rowIndex, 5).style = { alignment: { horizontal: 'right' as const } };
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '含稅總額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = total;
      worksheet.getCell(rowIndex, 5).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
    } else {
      // 不計算模式
      rowIndex++;
      worksheet.getCell(rowIndex, 4).value = '總額：';
      worksheet.getCell(rowIndex, 4).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
      worksheet.getCell(rowIndex, 5).value = total;
      worksheet.getCell(rowIndex, 5).style = { font: { bold: true }, alignment: { horizontal: 'right' as const } };
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

