/**
 * 統一的金額格式化
 *
 * 預設整數四捨五入 + 千分位（符合台灣報價單慣例）；
 * showDecimals 開啟時固定顯示兩位小數。
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  const decimals = showDecimals ? 2 : 0;
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return safeAmount.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Excel numFmt 字串，與 formatCurrency 顯示規則一致 */
export function currencyNumFmt(showDecimals: boolean = false): string {
  return showDecimals ? '#,##0.00' : '#,##0';
}
