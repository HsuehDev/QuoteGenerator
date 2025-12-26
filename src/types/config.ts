import type { ClientInfo, ProviderInfo, TaxConfig } from './quotation';

export interface QuotationConfig {
  // 報價單基本資訊（支援多個選項）
  title?: string[];
  subtitle?: string[];
  
  // 客戶資訊（可選，支援多個選項）
  client?: {
    companyName?: string[];
    contactPerson?: string[];
    phone?: string[];
    email?: string[];
    address?: string[];
    logo?: string; // Base64，通常只有一個
  };
  
  // 服務提供方資訊（可選，支援多個選項）
  provider?: {
    companyName?: string[];
    brandName?: string[];
    contactPerson?: string[];
    phone?: string[];
    email?: string[];
    address?: string[];
    taxId?: string[];
    logo?: string; // Base64，通常只有一個
    stamp?: string; // Base64，通常只有一個
  };
  
  // 稅率設定（可選，支援多個選項）
  taxConfig?: {
    name?: string[];
    rate?: number[];
    mode?: string[]; // TaxCalculationMode[]
  };
  
  // 備註（可選，支援多個選項）
  notes?: string[];
  
  // 顯示簽章區（可選）
  showSignatureSection?: boolean;
}

