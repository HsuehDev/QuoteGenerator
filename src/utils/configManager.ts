import type { QuotationConfig } from '@/types/config';

const CONFIG_FILE_NAME = 'quotation-config.json';

/**
 * 讀取設定檔
 */
export function loadConfig(): QuotationConfig | null {
  try {
    const configStr = localStorage.getItem(CONFIG_FILE_NAME);
    if (!configStr) return null;
    
    const config = JSON.parse(configStr) as QuotationConfig;
    return config;
  } catch (error) {
    console.error('讀取設定檔失敗:', error);
    return null;
  }
}

/**
 * 儲存設定檔
 */
export function saveConfig(config: QuotationConfig): boolean {
  try {
    localStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('儲存設定檔失敗:', error);
    return false;
  }
}

/**
 * 刪除設定檔
 */
export function deleteConfig(): boolean {
  try {
    localStorage.removeItem(CONFIG_FILE_NAME);
    return true;
  } catch (error) {
    console.error('刪除設定檔失敗:', error);
    return false;
  }
}

/**
 * 匯出設定檔為 JSON 檔案
 */
export function exportConfig(config: QuotationConfig): void {
  try {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = CONFIG_FILE_NAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('匯出設定檔失敗:', error);
    alert('匯出設定檔失敗');
  }
}

/**
 * 從檔案匯入設定檔
 */
export function importConfig(file: File): Promise<QuotationConfig | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content) as QuotationConfig;
        resolve(config);
      } catch (error) {
        console.error('匯入設定檔失敗:', error);
        alert('匯入設定檔失敗：檔案格式不正確');
        resolve(null);
      }
    };
    reader.onerror = () => {
      alert('讀取檔案失敗');
      resolve(null);
    };
    reader.readAsText(file);
  });
}

