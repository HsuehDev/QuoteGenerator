import type { LineItem, TaxConfig } from '@/types/quotation';

export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

/**
 * 計算稅額
 * @param subtotal 未稅金額（或含稅總額，取決於模式）
 * @param taxConfig 稅率設定
 * @returns 稅額（四捨五入至整數，符合台灣稅務實務）
 */
export function calculateTax(subtotal: number, taxConfig: TaxConfig): number {
  if (taxConfig.mode === 'none') {
    return 0;
  }
  
  let tax: number;
  if (taxConfig.mode === 'included') {
    // 內含：從含稅總額反推稅額
    // 含稅總額 = 未稅金額 * (1 + 稅率)
    // 稅額 = 含稅總額 - 未稅金額 = 含稅總額 * (稅率 / (1 + 稅率))
    tax = subtotal * (taxConfig.rate / (100 + taxConfig.rate));
  } else {
    // 外加：未稅金額 * 稅率
    tax = subtotal * (taxConfig.rate / 100);
  }
  
  // 台灣稅務實務：稅額必須四捨五入至整數
  return Math.round(tax);
}

/**
 * 計算未稅金額
 * @param subtotal 項目小計總和
 * @param taxConfig 稅率設定
 * @returns 未稅金額
 */
export function calculateSubtotalAfterTax(subtotal: number, taxConfig: TaxConfig): number {
  const mode = taxConfig.mode || 'excluded'; // 相容舊資料
  if (mode === 'included') {
    // 內含：從含稅總額反推未稅金額
    // 根據台灣稅務實務：先計算稅額（四捨五入），再用含稅總額減去稅額得到未稅金額
    const taxAmount = calculateTax(subtotal, taxConfig);
    return subtotal - taxAmount;
  } else {
    // 外加或不計算：未稅金額就是項目小計總和
    return subtotal;
  }
}

/**
 * 計算含稅總額
 * @param subtotal 項目小計總和
 * @param taxConfig 稅率設定
 * @returns 含稅總額（整數，符合台灣稅務實務）
 */
export function calculateTotal(subtotal: number, taxConfig: TaxConfig): number {
  const mode = taxConfig.mode || 'excluded'; // 相容舊資料
  if (mode === 'none') {
    return subtotal;
  }
  
  if (mode === 'included') {
    // 內含：項目小計總和就是含稅總額
    return subtotal;
  } else {
    // 外加：未稅金額 + 稅額（稅額已四捨五入至整數）
    const tax = calculateTax(subtotal, taxConfig);
    return subtotal + tax;
  }
}

