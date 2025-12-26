import { useMemo } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Diamond, FileText, Trash2, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { TaxCalculationMode } from '@/types/quotation';
import {
  calculateSubtotal,
  calculateSubtotalAfterTax,
  calculateTax,
  calculateTotal,
} from '@/utils/calculations';
import { convertImageToBase64 } from '@/utils/imageUtils';
import { useRef } from 'react';

export function QuotationDisplay() {
  const { currentQuotation, updateQuotation, updateClientInfo, updateProviderInfo, updateTaxConfig, updateLineItem, addLineItem, deleteLineItem, updateNotes } = useQuotationStore();
  const providerLogoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const base64 = await convertImageToBase64(file);
      updateProviderInfo({ logo: base64 });
    } catch (error) {
      alert(error instanceof Error ? error.message : '上傳圖片失敗');
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

  const quotationDate = currentQuotation.quotationDate 
    ? new Date(currentQuotation.quotationDate) 
    : new Date();
  const validUntil = currentQuotation.validUntil 
    ? new Date(currentQuotation.validUntil) 
    : new Date();

  const formatDate = (date: Date) => {
    return format(date, 'yyyy/MM/dd', { locale: zhTW });
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12 flex justify-center font-sans text-slate-800 print:bg-white print:p-0">
      {/* 報價單紙張 */}
      <div className="w-full max-w-[800px] bg-white shadow-sm border border-slate-200 p-10 md:p-14 flex flex-col relative print:shadow-none print:border-none" style={{ minHeight: '1123px' }}>
        
        {/* 1. Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-3">
            <div className="relative">
              {currentQuotation.provider.logo ? (
                <>
                  <img 
                    src={currentQuotation.provider.logo} 
                    alt="Logo" 
                    className="w-10 h-10 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => updateProviderInfo({ logo: undefined })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 export-hide"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 flex items-center justify-center text-blue-500">
                    <Diamond size={32} strokeWidth={1.5} />
                  </div>
                  <button
                    type="button"
                    onClick={() => providerLogoInputRef.current?.click()}
                    className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 export-hide"
                  >
                    <Upload className="h-3 w-3" />
                  </button>
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
              <Input
                value={currentQuotation.provider.companyName}
                onChange={(e) => updateProviderInfo({ companyName: e.target.value })}
                placeholder="公司名稱"
                className="text-lg font-bold tracking-tight text-slate-900 leading-invoice-lg uppercase border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text"
              />
              <Input
                value={currentQuotation.provider.brandName || ''}
                onChange={(e) => updateProviderInfo({ brandName: e.target.value })}
                placeholder="品牌名稱"
                className="text-[9px] text-blue-500 font-bold tracking-[0.2em] uppercase opacity-80 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border mt-0.5 invoice-text-xs"
              />
            </div>
          </div>
          <div className="text-right">
            <Input
              value={currentQuotation.title}
              onChange={(e) => updateQuotation({ title: e.target.value })}
              placeholder="專案報價單"
              className="text-2xl font-light text-slate-900 tracking-tight mb-1 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-right invoice-text leading-invoice-lg"
            />
            <Input
              value={currentQuotation.subtitle || ''}
              onChange={(e) => updateQuotation({ subtitle: e.target.value })}
              placeholder="QUOTATION"
              className="text-slate-400 text-[9px] tracking-[0.3em] font-medium border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-right invoice-text-xs"
            />
          </div>
        </div>

        {/* 文件基本資訊欄 */}
        <div className="grid grid-cols-3 border-y border-slate-100 py-4 mb-10">
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider invoice-text-xs">文件編號</span>
            <Input
              value={currentQuotation.quotationNumber}
              onChange={(e) => updateQuotation({ quotationNumber: e.target.value })}
              placeholder="DPT-20251226-008"
              className="text-xs font-mono border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text leading-invoice-base"
            />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider invoice-text-xs">發行日期</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto p-0 text-xs font-normal hover:bg-transparent export-hide-border invoice-text leading-invoice-base"
                >
                  {formatDate(quotationDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={quotationDate}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      updateQuotation({ quotationDate: format(date, 'yyyy-MM-dd') });
                    }
                  }}
                  locale={zhTW}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider invoice-text-xs">有效期至</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto p-0 text-xs text-blue-600 font-medium hover:bg-transparent export-hide-border invoice-text leading-invoice-base"
                >
                  {formatDate(validUntil)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={validUntil}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      updateQuotation({ validUntil: format(date, 'yyyy-MM-dd') });
                    }
                  }}
                  locale={zhTW}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 2. Info Section (簡約排版) */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 pb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold tracking-widest uppercase invoice-text-sm">致：對象單位</span>
            </div>
            <div className="space-y-1">
              <Input
                value={currentQuotation.client.companyName}
                onChange={(e) => updateClientInfo({ companyName: e.target.value })}
                placeholder="公司名稱"
                className="text-base font-bold text-slate-900 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text leading-invoice-lg"
              />
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <Input
                  value={currentQuotation.client.contactPerson}
                  onChange={(e) => updateClientInfo({ contactPerson: e.target.value })}
                  placeholder="聯絡人"
                  className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                />
                <Input
                  value={currentQuotation.client.email}
                  onChange={(e) => updateClientInfo({ email: e.target.value })}
                  placeholder="email@example.com"
                  className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                />
                <Input
                  value={currentQuotation.client.address}
                  onChange={(e) => updateClientInfo({ address: e.target.value })}
                  placeholder="地址"
                  className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 pb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold tracking-widest uppercase invoice-text-sm">自：服務單位</span>
            </div>
            <div className="space-y-1">
              <Input
                value={currentQuotation.provider.companyName}
                onChange={(e) => updateProviderInfo({ companyName: e.target.value })}
                placeholder="公司名稱"
                className="text-base font-bold text-slate-900 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text leading-invoice-lg"
              />
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <Input
                  value={currentQuotation.provider.contactPerson}
                  onChange={(e) => updateProviderInfo({ contactPerson: e.target.value })}
                  placeholder="聯絡人"
                  className="font-medium text-slate-700 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    value={currentQuotation.provider.phone}
                    onChange={(e) => updateProviderInfo({ phone: e.target.value })}
                    placeholder="電話"
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] flex-1 invoice-text-sm"
                  />
                  <span className="text-[11px] invoice-text-sm">|</span>
                  <Input
                    value={currentQuotation.provider.email}
                    onChange={(e) => updateProviderInfo({ email: e.target.value })}
                    placeholder="email"
                    className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] flex-1 invoice-text-sm"
                  />
                </div>
                <Input
                  value={currentQuotation.provider.address}
                  onChange={(e) => updateProviderInfo({ address: e.target.value })}
                  placeholder="地址"
                  className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[11px] invoice-text-sm"
                />
                <div className="text-[9px] invoice-text-xs">
                  <span>統一編號：</span>
                  <Input
                    value={currentQuotation.provider.taxId || ''}
                    onChange={(e) => updateProviderInfo({ taxId: e.target.value })}
                    placeholder="統一編號"
                    className="inline border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-[9px] w-24 invoice-text-xs"
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
                      className="text-sm font-bold text-slate-800 mb-1 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border invoice-text leading-invoice-base"
                    />
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                      placeholder="規格/描述"
                      className="text-xs text-slate-400 font-normal border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border resize-none min-h-0 invoice-text-sm"
                      rows={2}
                    />
                  </td>
                  <td className="invoice-cell text-center align-top">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="text-sm text-slate-500 font-mono border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-center w-12 invoice-text leading-invoice-base"
                    />
                  </td>
                  <td className="invoice-cell text-right align-top">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="text-sm text-slate-500 font-mono border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-right invoice-text leading-invoice-base"
                    />
                  </td>
                  <td className="invoice-cell text-right text-sm font-bold text-slate-800 font-mono align-top invoice-number">
                    {(item.quantity * item.unitPrice).toLocaleString()}
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
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-12 gap-8">
          <div className="col-span-7">
            <div className="flex items-center justify-between mb-2 text-slate-400">
              <div className="flex items-center gap-2">
                <FileText size={12} />
                <span className="text-[9px] font-bold uppercase tracking-widest invoice-text-xs">備註條款</span>
              </div>
              <div className="flex items-center gap-2 export-hide">
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
            <Textarea
              value={currentQuotation.notes}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="備註內容..."
              className="text-[10px] text-slate-400 whitespace-pre-wrap pl-1 italic border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border resize-none min-h-[60px] invoice-text-sm"
              rows={4}
            />
            
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
              <Select
                value={currentQuotation.taxConfig.mode || 'excluded'}
                onValueChange={(value) => updateTaxConfig({ mode: value as TaxCalculationMode })}
              >
                <SelectTrigger className="h-8 text-xs border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未稅（0%）</SelectItem>
                  <SelectItem value="included">含稅（內含）</SelectItem>
                  <SelectItem value="excluded">外加稅（加在未稅上）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currentQuotation.taxConfig.mode === 'none' ? (
              <>
                {/* 未稅模式：未稅合計＝應付總額 */}
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  <span className="invoice-text">未稅合計</span>
                  <span className="font-mono invoice-number">NT$ {totals.untaxed.toLocaleString()}</span>
                </div>
                <div className="mt-3 pt-4 border-t border-slate-900 flex justify-between items-baseline py-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest invoice-text leading-invoice-base">應付總額</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600 font-mono tracking-tighter invoice-amount-large">
                      NT$ {totals.total.toLocaleString()}
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
                  <span className="font-mono invoice-number">NT$ {totals.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  <span className="invoice-text">未稅金額</span>
                  <span className="font-mono invoice-number">NT$ {totals.untaxed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  <div className="flex items-center gap-1">
                    <Input
                      value={currentQuotation.taxConfig.name}
                      onChange={(e) => updateTaxConfig({ name: e.target.value })}
                      className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-sm w-16 invoice-text-sm"
                    />
                    <span className="invoice-text-sm">(</span>
                    <Input
                      type="number"
                      value={currentQuotation.taxConfig.rate}
                      onChange={(e) => updateTaxConfig({ rate: parseFloat(e.target.value) || 0 })}
                      className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-sm w-8 text-center invoice-text-sm"
                    />
                    <span className="invoice-text-sm">%)</span>
                  </div>
                  <span className="font-mono invoice-number">NT$ {totals.taxAmount.toLocaleString()}</span>
                </div>
                <div className="mt-3 pt-4 border-t border-slate-900 flex justify-between items-baseline py-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest invoice-text leading-invoice-base">應付總額</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600 font-mono tracking-tighter invoice-amount-large">
                      NT$ {totals.total.toLocaleString()}
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
                  <span className="font-mono invoice-number">NT$ {totals.untaxed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 px-1 py-1">
                  <div className="flex items-center gap-1">
                    <Input
                      value={currentQuotation.taxConfig.name}
                      onChange={(e) => updateTaxConfig({ name: e.target.value })}
                      className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-sm w-16 invoice-text-sm"
                    />
                    <span className="invoice-text-sm">(</span>
                    <Input
                      type="number"
                      value={currentQuotation.taxConfig.rate}
                      onChange={(e) => updateTaxConfig({ rate: parseFloat(e.target.value) || 0 })}
                      className="border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 export-hide-border text-sm w-8 text-center invoice-text-sm"
                    />
                    <span className="invoice-text-sm">%)</span>
                  </div>
                  <span className="font-mono invoice-number">NT$ {totals.taxAmount.toLocaleString()}</span>
                </div>
                <div className="mt-3 pt-4 border-t border-slate-900 flex justify-between items-baseline py-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest invoice-text leading-invoice-base">應付總額</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600 font-mono tracking-tighter invoice-amount-large">
                      NT$ {totals.total.toLocaleString()}
                    </div>
                    <div className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-1 invoice-text-xs">Total Amount Due</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 頁尾 */}
        <div className="mt-12 pt-6 border-t border-slate-50 text-center">
          <p className="text-[8px] text-slate-300 font-bold tracking-[0.5em] uppercase invoice-text-xs">
            {currentQuotation.provider.brandName || currentQuotation.provider.companyName || 'COMPANY NAME'} | INNOVATION & PRECISION
          </p>
        </div>
      </div>
    </div>
  );
}

