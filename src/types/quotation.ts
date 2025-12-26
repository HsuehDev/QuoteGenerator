export interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ClientInfo {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  logo?: string; // Base64
}

export interface ProviderInfo {
  companyName: string;
  brandName?: string; // 品牌名稱
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId?: string; // 統一編號
  logo?: string; // Base64
  stamp?: string; // Base64 (發票章/公司章)
}

export type TaxCalculationMode = 'included' | 'excluded' | 'none';

export interface TaxConfig {
  name: string; // 稅目名稱（如：營業稅、VAT）
  rate: number; // 稅率百分比
  mode: TaxCalculationMode; // 計算方式：'included' 內含, 'excluded' 外加, 'none' 不計算
}

export interface Quotation {
  id: string;
  title: string;
  subtitle?: string; // 副標題（如：QUOTATION）
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  client: ClientInfo;
  provider: ProviderInfo;
  items: LineItem[];
  taxConfig: TaxConfig;
  notes: string;
  showSignatureSection?: boolean; // 是否顯示簽章區
  createdAt: string;
  updatedAt: string;
}

