import { format } from 'date-fns';

/**
 * 生成文件編號
 * 格式：DTP-YYYYMMDD-00X
 * 其中：
 * - DTP 為固定前綴
 * - YYYYMMDD 為當前日期
 * - 00X 為當天的序號（從 001 開始）
 */
export function generateQuotationNumber(): string {
  const today = new Date();
  const dateStr = format(today, 'yyyyMMdd');
  const storageKey = 'quotation-number-counter';
  const dateKey = 'quotation-number-date';
  
  // 檢查 localStorage 中是否有今天的日期記錄
  const lastDate = localStorage.getItem(dateKey);
  const todayStr = format(today, 'yyyy-MM-dd');
  
  let sequence = 1;
  
  if (lastDate === todayStr) {
    // 如果是同一天，讀取並遞增序號
    const lastSequence = localStorage.getItem(storageKey);
    if (lastSequence) {
      sequence = parseInt(lastSequence, 10) + 1;
    }
  } else {
    // 如果是新的一天，重置序號為 1
    sequence = 1;
  }
  
  // 儲存今天的日期和序號
  localStorage.setItem(dateKey, todayStr);
  localStorage.setItem(storageKey, sequence.toString());
  
  // 格式化序號為三位數（001, 002, ...）
  const sequenceStr = sequence.toString().padStart(3, '0');
  
  return `DTP-${dateStr}-${sequenceStr}`;
}

