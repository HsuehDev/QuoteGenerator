import { useMemo, useEffect, forwardRef } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import { useConfigStore } from '@/stores/configStore';
import { Input } from '@/components/ui/input';
import { AutoResizeTextarea } from '@/components/AutoResizeTextarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Diamond, FileText, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { format, addMonths, parse } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { TaxCalculationMode } from '@/types/quotation';
import {
  calculateSubtotal,
  calculateSubtotalAfterTax,
  calculateTax,
  calculateTotal,
} from '@/utils/calculations';
import { convertImageToBase64 } from '@/utils/imageUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { useRef } from 'react';
import { generateQuotationNumber } from '@/utils/quotationNumber';
import { ConfigValueSelector } from '@/components/ConfigValueSelector';
import { InputWithConfigOptions } from '@/components/InputWithConfigOptions';
import { TextareaWithConfigOptions } from '@/components/TextareaWithConfigOptions';
import { HelpButton } from '@/components/HelpButton';
import { FieldHelpContent } from '@/components/HelpContent';
import { toast } from '@/components/ToastContainer';

export const QuotationDisplay = forwardRef<HTMLDivElement>((_props, ref) => {
  const { currentQuotation, updateQuotation, updateClientInfo, updateProviderInfo, updateTaxConfig, updateLineItem, addLineItem, deleteLineItem, updateNotes } = useQuotationStore();
  const { config } = useConfigStore();
  const providerLogoInputRef = useRef<HTMLInputElement>(null);

  // 如果編號為空，自動生成
  useEffect(() => {
    if (currentQuotation && !currentQuotation.quotationNumber) {
      updateQuotation({ quotationNumber: generateQuotationNumber() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuotation?.id]); // 只在報價單 ID 改變時檢查，避免重複生成

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const base64 = await convertImageToBase64(file);
      updateProviderInfo({ logo: base64 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上傳圖片失敗');
    }
  };

  const totals = useMemo(() => {
    if (!currentQuotation) {
      return { untaxed: 0, taxAmount: 0, total: 0 };
    }
    const rawSubtotal = calculateSubtotal(currentQuotation.items);
    const untaxed = calculateSubtotalAfterTax(rawSubtotal, currentQuotation.taxConfig);
    const taxAmount = calculateTax(rawSubtotal, currentQuotation.taxConfig);
    const total = calculateTotal(rawSubtotal, currentQuotation.taxConfig);

    return { untaxed, taxAmount, total };
  }, [currentQuotation]);

  if (!currentQuotation) return null;

  const showDecimals = currentQuotation.showDecimals === true;

  // 從 store 讀取日期，如果沒有則使用預設值
  const quotationDate = currentQuotation.quotationDate
    ? parse(currentQuotation.quotationDate, 'yyyy-MM-dd', new Date())
    : new Date();
  const validUntil = currentQuotation.validUntil
    ? parse(currentQuotation.validUntil, 'yyyy-MM-dd', new Date())
    : addMonths(new Date(), 1);

  const formatDate = (date: Date) => {
    return format(date, 'yyyy/MM/dd', { locale: zhTW });
  };

  const formatDateForStore = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12 flex justify-center font-sans text-slate-800 print:bg-white print:p-0">
      {/* 報價單紙張 */}
      <div ref={ref} className="w-[794px] bg-white shadow-sm border border-slate-200 p-10 md:p-14 flex flex-col relative print:shadow-none print:border-none" style={{ minHeight: '1123px' }}>
        
        {/* 1. Header Section */}
        <div className="flex justify-between items-start mb-12" data-export-block>
          <div className="flex items-center gap-3">
            <div className="relative">
              {currentQuotation.provider.logo ? (
                <>
                  <img 
                    src={currentQuotation.provider.logo} 
                    alt="Logo" 
                    className="w-10 h-10 object-contain"
                  />
                  <div className="absolute -top-2 -right-2 flex gap-1 export-hide">
                    {config?.provider?.logo && (
                      <button
                        type="button"
                        onClick={() => updateProviderInfo({ logo: config?.provider?.logo })}
                        className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600"
                        title="從設定檔選擇 Logo"
                      >
                        <Sparkles className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => updateProviderInfo({ logo: undefined })}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      title="刪除 Logo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 flex items-center justify-center text-blue-500">
                    <Diamond size={32} strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 flex gap-1 export-hide">
                    {config?.provider?.logo && (
                      <button
                        type="button"
                        onClick={() => updateProviderInfo({ logo: config?.provider?.logo })}
                        className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600"
                        title="從設定檔選擇 Logo"
                      >
                        <Sparkles className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => providerLogoInputRef.current?.click()}
                      className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600"
                      title="上傳 Logo"
                    >
                      <Upload className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
              <input
                ref={providerLogoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleLogoUpload(file);
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2" data-tour="company-name-input">
                <InputWithConfigOptions
                  value={currentQuotation.provider.companyName}
                  onChange={(value) => updateProviderInfo({ companyName: value })}
                  configValues={config?.provider?.companyName}
                  configKey="provider.companyName"
                  placeholder="公司名稱"
                  maxLength={100}
                  className="text-lg font-bold tracking-tight text-slate-900 leading-invoice-lg uppercase border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text"
                  onSelect={(value) => updateProviderInfo({ companyName: String(value) })}
                />
                <div className="export-hide">
                  <HelpButton
                    content={<FieldHelpContent />}
                    side="right"
                    align="start"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <InputWithConfigOptions
                  value={currentQuotation.provider.brandName || ''}
                  onChange={(value) => updateProviderInfo({ brandName: value })}
                  configValues={config?.provider?.brandName}
                  configKey="provider.brandName"
                  placeholder="品牌名稱"
                  maxLength={50}
                  className="text-[9px] text-blue-500 font-bold tracking-[0.2em] uppercase opacity-80 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text-xs"
                  onSelect={(value) => updateProviderInfo({ brandName: String(value) })}
                />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <InputWithConfigOptions
                value={currentQuotation.title}
                onChange={(value) => updateQuotation({ title: value })}
                configValues={config?.title}
                configKey="title"
                placeholder="專案報價單"
                maxLength={50}
                className="text-2xl font-light text-slate-900 tracking-tight border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-right invoice-text leading-invoice-lg"
                onSelect={(value) => updateQuotation({ title: String(value) })}
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <InputWithConfigOptions
                value={currentQuotation.subtitle || ''}
                onChange={(value) => updateQuotation({ subtitle: value })}
                configValues={config?.subtitle}
                configKey="subtitle"
                placeholder="QUOTATION"
                maxLength={50}
                className="text-slate-400 text-[9px] tracking-[0.3em] font-medium border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-right invoice-text-xs"
                onSelect={(value) => updateQuotation({ subtitle: String(value) })}
              />
            </div>
          </div>
        </div>

        {/* 文件基本資訊欄 */}
        <div className="grid grid-cols-3 border-y border-slate-100 py-4 mb-10" data-export-block>
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider invoice-text-xs">文件編號</span>
            <Input
              value={currentQuotation.quotationNumber}
              onChange={(e) => updateQuotation({ quotationNumber: e.target.value })}
              placeholder="DTP-20251226-001"
              maxLength={50}
              className="text-xs font-mono border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text leading-invoice-base"
            />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider invoice-text-xs">發行日期</span>
            <div className="text-xs font-normal invoice-text leading-invoice-base print:block hidden">
              {formatDate(quotationDate)}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-xs font-normal invoice-text leading-invoice-base hover:text-blue-600 transition-colors export-hide-border border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer text-left print:hidden"
                >
                  {formatDate(quotationDate)}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={quotationDate}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      updateQuotation({ quotationDate: formatDateForStore(date) });
                    }
                  }}
                  locale={zhTW}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider invoice-text-xs">有效期至</span>
            <div className="text-xs text-blue-600 font-medium invoice-text leading-invoice-base print:block hidden">
              {formatDate(validUntil)}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-xs text-blue-600 font-medium invoice-text leading-invoice-base hover:text-blue-700 transition-colors export-hide-border border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer text-right print:hidden"
                >
                  {formatDate(validUntil)}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="end">
                <Calendar
                  mode="single"
                  selected={validUntil}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      updateQuotation({ validUntil: formatDateForStore(date) });
                    }
                  }}
                  locale={zhTW}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 2. Info Section (簡約排版) */}
        <div className="grid grid-cols-2 gap-12 mb-12" data-export-block>
          {/* 對象單位 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 pb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold tracking-widest uppercase invoice-text-sm">致：對象單位</span>
            </div>
            {/* 匯出時顯示純文字（只顯示有值的欄位） */}
            <div className="space-y-1 export-only">
              {currentQuotation.client.companyName && (
                <div className="text-base font-bold text-slate-900 invoice-text leading-invoice-lg">{currentQuotation.client.companyName}</div>
              )}
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                {currentQuotation.client.contactPerson && (
                  <div className="invoice-text-sm">{currentQuotation.client.contactPerson}</div>
                )}
                {currentQuotation.client.phone && (
                  <div className="invoice-text-sm">{currentQuotation.client.phone}</div>
                )}
                {currentQuotation.client.email && (
                  <div className="invoice-text-sm">{currentQuotation.client.email}</div>
                )}
                {currentQuotation.client.address && (
                  <div className="invoice-text-sm">{currentQuotation.client.address}</div>
                )}
                {currentQuotation.client.taxId && (
                  <div className="text-[9px] invoice-text-xs">統一編號：{currentQuotation.client.taxId}</div>
                )}
              </div>
            </div>
            {/* 編輯時顯示 Input */}
            <div className="space-y-1 export-hide">
              <div className="flex items-center gap-1">
                <InputWithConfigOptions
                  value={currentQuotation.client.companyName}
                  onChange={(value) => updateClientInfo({ companyName: value })}
                  configValues={config?.client?.companyName}
                  configKey="client.companyName"
                  placeholder="公司名稱"
                  maxLength={100}
                  className="text-base font-bold text-slate-900 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text leading-invoice-lg"
                  onSelect={(value) => updateClientInfo({ companyName: String(value) })}
                />
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div className="flex items-center gap-1">
                  <InputWithConfigOptions
                    value={currentQuotation.client.contactPerson}
                    onChange={(value) => updateClientInfo({ contactPerson: value })}
                    configValues={config?.client?.contactPerson}
                    configKey="client.contactPerson"
                    placeholder="聯絡人"
                    maxLength={50}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                    onSelect={(value) => updateClientInfo({ contactPerson: String(value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <InputWithConfigOptions
                    value={currentQuotation.client.phone}
                    onChange={(value) => updateClientInfo({ phone: value })}
                    configValues={config?.client?.phone}
                    configKey="client.phone"
                    placeholder="電話"
                    maxLength={30}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                    onSelect={(value) => updateClientInfo({ phone: String(value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <InputWithConfigOptions
                    value={currentQuotation.client.email}
                    onChange={(value) => updateClientInfo({ email: value })}
                    configValues={config?.client?.email}
                    configKey="client.email"
                    placeholder="email@example.com"
                    maxLength={100}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                    onSelect={(value) => updateClientInfo({ email: String(value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <InputWithConfigOptions
                    value={currentQuotation.client.address}
                    onChange={(value) => updateClientInfo({ address: value })}
                    configValues={config?.client?.address}
                    configKey="client.address"
                    placeholder="地址"
                    maxLength={200}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                    onSelect={(value) => updateClientInfo({ address: String(value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] invoice-text-xs whitespace-nowrap">統一編號：</span>
                  <InputWithConfigOptions
                    value={currentQuotation.client.taxId || ''}
                    onChange={(value) => updateClientInfo({ taxId: value.replace(/\D/g, '') })}
                    configValues={config?.client?.taxId}
                    configKey="client.taxId"
                    placeholder="統一編號"
                    maxLength={8}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[9px] w-24 invoice-text-xs"
                    onSelect={(value) => updateClientInfo({ taxId: String(value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 服務單位 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 pb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold tracking-widest uppercase invoice-text-sm">自：服務單位</span>
            </div>
            {/* 匯出時顯示純文字（只顯示有值的欄位） */}
            <div className="space-y-1 export-only">
              {currentQuotation.provider.companyName && (
                <div className="text-base font-bold text-slate-900 invoice-text leading-invoice-lg">{currentQuotation.provider.companyName}</div>
              )}
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                {currentQuotation.provider.contactPerson && (
                  <div className="font-medium text-slate-700 invoice-text-sm">{currentQuotation.provider.contactPerson}</div>
                )}
                {currentQuotation.provider.phone && (
                  <div className="invoice-text-sm">{currentQuotation.provider.phone}</div>
                )}
                {currentQuotation.provider.email && (
                  <div className="invoice-text-sm">{currentQuotation.provider.email}</div>
                )}
                {currentQuotation.provider.address && (
                  <div className="invoice-text-sm">{currentQuotation.provider.address}</div>
                )}
                {currentQuotation.provider.taxId && (
                  <div className="text-[9px] invoice-text-xs">統一編號：{currentQuotation.provider.taxId}</div>
                )}
              </div>
            </div>
            {/* 編輯時顯示 Input */}
            <div className="space-y-1 export-hide">
              <div className="flex items-center gap-1">
                <InputWithConfigOptions
                  value={currentQuotation.provider.companyName}
                  onChange={(value) => updateProviderInfo({ companyName: value })}
                  configValues={config?.provider?.companyName}
                  configKey="provider.companyName"
                  placeholder="公司名稱"
                  maxLength={100}
                  className="text-base font-bold text-slate-900 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text leading-invoice-lg"
                  onSelect={(value) => updateProviderInfo({ companyName: String(value) })}
                />
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div className="flex items-center gap-1">
                  <InputWithConfigOptions
                    value={currentQuotation.provider.contactPerson}
                    onChange={(value) => updateProviderInfo({ contactPerson: value })}
                    configValues={config?.provider?.contactPerson}
                    configKey="provider.contactPerson"
                    placeholder="聯絡人"
                    maxLength={50}
                    className="font-medium text-slate-700 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                    onSelect={(value) => updateProviderInfo({ contactPerson: String(value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <InputWithConfigOptions
                    value={currentQuotation.provider.phone}
                    onChange={(value) => updateProviderInfo({ phone: value })}
                    configValues={config?.provider?.phone}
                    configKey="provider.phone"
                    placeholder="電話"
                    maxLength={30}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                    onSelect={(value) => updateProviderInfo({ phone: String(value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <InputWithConfigOptions
                    value={currentQuotation.provider.email}
                    onChange={(value) => updateProviderInfo({ email: value })}
                    configValues={config?.provider?.email}
                    configKey="provider.email"
                    placeholder="email"
                    maxLength={100}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                    onSelect={(value) => updateProviderInfo({ email: String(value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <InputWithConfigOptions
                    value={currentQuotation.provider.address}
                    onChange={(value) => updateProviderInfo({ address: value })}
                    configValues={config?.provider?.address}
                    configKey="provider.address"
                    placeholder="地址"
                    maxLength={200}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                    onSelect={(value) => updateProviderInfo({ address: String(value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] invoice-text-xs whitespace-nowrap">統一編號：</span>
                  <InputWithConfigOptions
                    value={currentQuotation.provider.taxId || ''}
                    onChange={(value) => updateProviderInfo({ taxId: value.replace(/\D/g, '') })}
                    configValues={config?.provider?.taxId}
                    configKey="provider.taxId"
                    placeholder="統一編號"
                    maxLength={8}
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[9px] w-24 invoice-text-xs"
                    onSelect={(value) => updateProviderInfo({ taxId: String(value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Table Section (緊湊型設計) */}
        <div className="flex-grow">
          <div className="mb-4 export-hide">
            <Button
              type="button"
              onClick={addLineItem}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              + 新增項目
            </Button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-[9px] font-bold uppercase tracking-widest text-left border-b border-slate-100">
                <th className="invoice-cell-sm invoice-text-xs">項目內容</th>
                <th className="invoice-cell-sm invoice-text-xs text-center w-20">數量</th>
                <th className="invoice-cell-sm invoice-text-xs text-right w-32">單價</th>
                <th className="invoice-cell-sm invoice-text-xs text-right w-32">小計</th>
                <th className="invoice-cell-sm w-12 export-hide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentQuotation.items.map((item) => (
                <tr key={item.id}>
                  <td className="invoice-cell pr-4 align-top">
                    <Input
                      value={item.name}
                      onChange={(e) => updateLineItem(item.id, { name: e.target.value })}
                      placeholder="項目名稱"
                      maxLength={200}
                      className="text-sm font-bold text-slate-800 mb-1 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text leading-invoice-base"
                    />
                    <AutoResizeTextarea
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                      placeholder="規格/描述"
                      maxLength={1000}
                      className="text-xs text-slate-400 font-normal border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border resize-none min-h-0 invoice-text-sm"
                      rows={2}
                    />
                  </td>
                  <td className="invoice-cell text-center align-top">
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, { quantity: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="text-sm text-slate-500 font-mono border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-center w-12 invoice-text leading-invoice-base"
                    />
                  </td>
                  <td className="invoice-cell text-right align-top">
                    <span className="export-only-inline text-sm text-slate-500 font-mono invoice-text leading-invoice-base">
                      {formatCurrency(item.unitPrice, showDecimals)}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="export-hide text-sm text-slate-500 font-mono border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-right invoice-text leading-invoice-base"
                    />
                  </td>
                  <td className="invoice-cell text-right text-sm font-bold text-slate-800 font-mono align-top invoice-number">
                    {formatCurrency(item.quantity * item.unitPrice, showDecimals)}
                  </td>
                  <td className="invoice-cell text-center export-hide align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLineItem(item.id)}
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {currentQuotation.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="invoice-cell text-center text-slate-400 text-sm invoice-text">
                    尚無報價項目
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Footer Summary (潔白設計) */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-12 gap-8" data-export-block>
          <div className="col-span-7">
            <div className="flex items-center justify-between mb-2 text-slate-400">
              <div className="flex items-center gap-2">
                <FileText size={12} />
                <span className="text-[9px] font-bold uppercase tracking-widest invoice-text-xs">備註條款</span>
              </div>
              <div className="flex items-center gap-3 export-hide">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showDecimals"
                    checked={showDecimals}
                    onChange={(e) => updateQuotation({ showDecimals: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="showDecimals"
                    className="text-[9px] text-slate-500 font-medium cursor-pointer invoice-text-xs"
                  >
                    顯示小數
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showSignatureSection"
                    checked={currentQuotation.showSignatureSection !== false}
                    onChange={(e) => updateQuotation({ showSignatureSection: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="showSignatureSection"
                    className="text-[9px] text-slate-500 font-medium cursor-pointer invoice-text-xs"
                  >
                    顯示簽章區
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <TextareaWithConfigOptions
                value={currentQuotation.notes}
                onChange={(value) => updateNotes(value)}
                configValues={config?.notes}
                configKey="notes"
                placeholder="備註內容..."
                maxLength={2000}
                className="text-[10px] text-slate-400 whitespace-pre-wrap pl-1 italic border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border resize-none min-h-[60px] invoice-text-sm"
                rows={4}
                onSelect={(value) => updateNotes(String(value))}
              />
            </div>
            
            {/* 簽章區 */}
            {currentQuotation.showSignatureSection !== false && (
              <div className="grid grid-cols-2 gap-10 mt-10">
                <div className="space-y-8">
                  <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest invoice-text-xs">客戶簽署</div>
                  <div className="h-px bg-slate-100 w-full" />
                </div>
                <div className="space-y-8">
                  <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest invoice-text-xs">公司蓋章</div>
                  <div className="h-px bg-slate-100 w-full" />
                </div>
              </div>
            )}
          </div>

          <div className="col-span-5 flex flex-col justify-end space-y-2">
            {/* 稅金模式選擇器 */}
            <div className="mb-3 export-hide">
              <div className="flex items-center gap-2">
                <Select
                  value={currentQuotation.taxConfig.mode || 'excluded'}
                  onValueChange={(value) => updateTaxConfig({ mode: value as TaxCalculationMode })}
                >
                  <SelectTrigger className="h-8 text-xs border-slate-200 bg-white flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">未稅（0%）</SelectItem>
                    <SelectItem value="included">含稅（內含）</SelectItem>
                    <SelectItem value="excluded">外加稅（加在未稅上）</SelectItem>
                  </SelectContent>
                </Select>
                {config?.taxConfig?.mode && config.taxConfig.mode.length > 0 && (
                  <ConfigValueSelector
                    configKey="taxConfig.mode"
                    configValues={config.taxConfig.mode}
                    currentValue={currentQuotation.taxConfig.mode || 'excluded'}
                    onSelect={(value) => updateTaxConfig({ mode: value as TaxCalculationMode })}
                    className="flex-shrink-0"
                  />
                )}
              </div>
            </div>
            {currentQuotation.taxConfig.mode === 'none' ? (
              <>
                {/* 未稅模式：未稅合計＝應付總額 */}
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  <span className="invoice-text">未稅合計</span>
                  <span className="font-mono invoice-number">NT$ {formatCurrency(totals.untaxed, showDecimals)}</span>
                </div>
                <div className="mt-3 pt-4 border-t border-slate-900 flex justify-between items-baseline py-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest invoice-text leading-invoice-base">應付總額</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600 font-mono tracking-tighter invoice-amount-large">
                      NT$ {formatCurrency(totals.total, showDecimals)}
                    </div>
                    <div className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-1 invoice-text-xs">Total Amount Due</div>
                  </div>
                </div>
              </>
            ) : currentQuotation.taxConfig.mode === 'included' ? (
              <>
                {/* 含稅模式：顯示含稅總額、未稅金額、稅額（反推） */}
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  <span className="invoice-text">含稅總額</span>
                  <span className="font-mono invoice-number">NT$ {formatCurrency(totals.total, showDecimals)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  <span className="invoice-text">未稅金額</span>
                  <span className="font-mono invoice-number">NT$ {formatCurrency(totals.untaxed, showDecimals)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  {/* 匯出時顯示純文字 */}
                  <span className="invoice-text-sm export-only-inline">{currentQuotation.taxConfig.name} ({currentQuotation.taxConfig.rate}%)</span>
                  {/* 編輯時顯示 Input */}
                  <div className="flex items-center gap-1 export-hide">
                    <div className="flex items-center gap-1">
                      <InputWithConfigOptions
                        value={currentQuotation.taxConfig.name}
                        onChange={(value) => updateTaxConfig({ name: value })}
                        configValues={config?.taxConfig?.name}
                        configKey="taxConfig.name"
                        maxLength={20}
                        className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-sm w-16 invoice-text-sm"
                        onSelect={(value) => updateTaxConfig({ name: String(value) })}
                      />
                    </div>
                    <span className="invoice-text-sm">(</span>
                    <div className="flex items-center gap-1">
                      <InputWithConfigOptions
                        type="number"
                        value={currentQuotation.taxConfig.rate}
                        onChange={(value) => updateTaxConfig({ rate: Math.min(100, Math.max(0, parseFloat(value) || 0)) })}
                        configValues={config?.taxConfig?.rate ? config.taxConfig.rate.map(r => String(r)) : undefined}
                        configKey="taxConfig.rate"
                        className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-sm w-8 text-center invoice-text-sm"
                        onSelect={(value) => updateTaxConfig({ rate: Number(value) })}
                      />
                    </div>
                    <span className="invoice-text-sm">%)</span>
                  </div>
                  <span className="font-mono invoice-number">NT$ {formatCurrency(totals.taxAmount, showDecimals)}</span>
                </div>
                <div className="mt-3 pt-4 border-t border-slate-900 flex justify-between items-baseline py-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest invoice-text leading-invoice-base">應付總額</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600 font-mono tracking-tighter invoice-amount-large">
                      NT$ {formatCurrency(totals.total, showDecimals)}
                    </div>
                    <div className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-1 invoice-text-xs">Total Amount Due</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 外加稅模式：未稅合計 + 稅額 = 應付總額 */}
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  <span className="invoice-text">未稅合計</span>
                  <span className="font-mono invoice-number">NT$ {formatCurrency(totals.untaxed, showDecimals)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  {/* 匯出時顯示純文字 */}
                  <span className="invoice-text-sm export-only-inline">{currentQuotation.taxConfig.name} ({currentQuotation.taxConfig.rate}%)</span>
                  {/* 編輯時顯示 Input */}
                  <div className="flex items-center gap-1 export-hide">
                    <div className="flex items-center gap-1">
                      <InputWithConfigOptions
                        value={currentQuotation.taxConfig.name}
                        onChange={(value) => updateTaxConfig({ name: value })}
                        configValues={config?.taxConfig?.name}
                        configKey="taxConfig.name"
                        maxLength={20}
                        className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-sm w-16 invoice-text-sm"
                        onSelect={(value) => updateTaxConfig({ name: String(value) })}
                      />
                    </div>
                    <span className="invoice-text-sm">(</span>
                    <div className="flex items-center gap-1">
                      <InputWithConfigOptions
                        type="number"
                        value={currentQuotation.taxConfig.rate}
                        onChange={(value) => updateTaxConfig({ rate: Math.min(100, Math.max(0, parseFloat(value) || 0)) })}
                        configValues={config?.taxConfig?.rate ? config.taxConfig.rate.map(r => String(r)) : undefined}
                        configKey="taxConfig.rate"
                        className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-sm w-8 text-center invoice-text-sm"
                        onSelect={(value) => updateTaxConfig({ rate: Number(value) })}
                      />
                    </div>
                    <span className="invoice-text-sm">%)</span>
                  </div>
                  <span className="font-mono invoice-number">NT$ {formatCurrency(totals.taxAmount, showDecimals)}</span>
                </div>
                <div className="mt-3 pt-4 border-t border-slate-900 flex justify-between items-baseline py-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest invoice-text leading-invoice-base">應付總額</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600 font-mono tracking-tighter invoice-amount-large">
                      NT$ {formatCurrency(totals.total, showDecimals)}
                    </div>
                    <div className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-1 invoice-text-xs">Total Amount Due</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 頁尾 */}
        <div className="mt-12 pt-6 border-t border-slate-50 text-center" data-export-block>
          <div className="flex items-center justify-center gap-2">
            <InputWithConfigOptions
              value={currentQuotation.footerText || `${currentQuotation.provider.brandName || currentQuotation.provider.companyName || 'COMPANY NAME'} | INNOVATION & PRECISION`}
              onChange={(value) => updateQuotation({ footerText: value })}
              configValues={config?.footerText}
              configKey="footerText"
              placeholder="DELVEDRILL TECH | INNOVATION & PRECISION"
              maxLength={100}
              className="text-[8px] text-slate-300 font-bold tracking-[0.5em] uppercase invoice-text-xs border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-center"
              onSelect={(value) => updateQuotation({ footerText: String(value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

QuotationDisplay.displayName = 'QuotationDisplay';

