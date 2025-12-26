import type { ClientInfo, ProviderInfo, TaxConfig } from './quotation';

export interface QuotationConfig {
  // 報價單基本資訊
  title?: string;
  subtitle?: string;
  
  // 客戶資訊（可選）
  client?: Partial<ClientInfo>;
  
  // 服務提供方資訊（可選）
  provider?: Partial<ProviderInfo>;
  
  // 稅率設定（可選）
  taxConfig?: Partial<TaxConfig>;
  
  // 備註（可選）
  notes?: string;
  
  // 顯示簽章區（可選）
  showSignatureSection?: boolean;
}

