import { useQuotationStore } from '@/stores/quotationStore';
import { useConfigStore } from '@/stores/configStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  calculateSubtotal,
  calculateSubtotalAfterTax,
  calculateTax,
  calculateTotal,
} from '@/utils/calculations';
import { useMemo } from 'react';
import type { TaxCalculationMode } from '@/types/quotation';
import { ConfigValueSelector } from '@/components/ConfigValueSelector';

export function SummarySection() {
  const { currentQuotation, updateTaxConfig, updateNotes } = useQuotationStore();
  const { config } = useConfigStore();

  const calculations = useMemo(() => {
    if (!currentQuotation) {
      return { subtotal: 0, tax: 0, total: 0, subtotalAfterTax: 0 };
    }

    const subtotal = calculateSubtotal(currentQuotation.items);
    const subtotalAfterTax = calculateSubtotalAfterTax(subtotal, currentQuotation.taxConfig);
    const tax = calculateTax(subtotal, currentQuotation.taxConfig);
    const total = calculateTotal(subtotal, currentQuotation.taxConfig);

    return { subtotal, subtotalAfterTax, tax, total };
  }, [currentQuotation]);

  if (!currentQuotation) return null;

  const handleTaxModeChange = (mode: string) => {
    updateTaxConfig({ mode: mode as TaxCalculationMode });
  };

  return (
    <div className="space-y-6">
      {/* 總計區塊 */}
      <Card>
        <CardHeader>
          <CardTitle>金額計算</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="taxName">稅目名稱</Label>
                <ConfigValueSelector
                  configKey="taxConfig.name"
                  configValue={config?.taxConfig?.name}
                  currentValue={currentQuotation.taxConfig.name}
                  onSelect={(value) => updateTaxConfig({ name: String(value) })}
                />
              </div>
              <Input
                id="taxName"
                value={currentQuotation.taxConfig.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateTaxConfig({ name: e.target.value })
                }
                placeholder="營業稅"
                className="export-hide-border"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="taxRate">稅率 (%)</Label>
                {config?.taxConfig?.rate !== undefined && (
                  <ConfigValueSelector
                    configKey="taxConfig.rate"
                    configValue={config.taxConfig.rate}
                    currentValue={currentQuotation.taxConfig.rate}
                    onSelect={(value) => updateTaxConfig({ rate: Number(value) })}
                  />
                )}
              </div>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={currentQuotation.taxConfig.rate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const rate = parseFloat(e.target.value) || 0;
                  updateTaxConfig({ rate });
                }}
                className="export-hide-border"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="taxMode">計算方式</Label>
                {config?.taxConfig?.mode !== undefined && (
                  <ConfigValueSelector
                    configKey="taxConfig.mode"
                    configValue={config.taxConfig.mode}
                    currentValue={currentQuotation.taxConfig.mode || 'excluded'}
                    onSelect={(value) => updateTaxConfig({ mode: value as TaxCalculationMode })}
                  />
                )}
              </div>
              <Select
                value={currentQuotation.taxConfig.mode || 'excluded'}
                onValueChange={handleTaxModeChange}
              >
                <SelectTrigger id="taxMode" className="export-hide-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未稅（0%）</SelectItem>
                  <SelectItem value="included">含稅（內含）</SelectItem>
                  <SelectItem value="excluded">外加稅（加在未稅上）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            {(currentQuotation.taxConfig.mode || 'excluded') === 'included' ? (
              <>
                {/* 內含模式：顯示含稅總額、未稅金額、稅額 */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">含稅總額：</span>
                  <span className="text-lg font-medium">
                    ${calculations.subtotal.toLocaleString('zh-TW', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">未稅金額：</span>
                  <span className="text-lg font-medium">
                    ${calculations.subtotalAfterTax.toLocaleString('zh-TW', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {currentQuotation.taxConfig.name} ({currentQuotation.taxConfig.rate}%)：
                  </span>
                  <span className="text-lg font-medium">
                    ${calculations.tax.toLocaleString('zh-TW', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </>
            ) : (currentQuotation.taxConfig.mode || 'excluded') === 'excluded' ? (
              <>
                {/* 外加模式：顯示未稅金額、稅額、含稅總額 */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">未稅金額：</span>
                  <span className="text-lg font-medium">
                    ${calculations.subtotal.toLocaleString('zh-TW', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {currentQuotation.taxConfig.name} ({currentQuotation.taxConfig.rate}%)：
                  </span>
                  <span className="text-lg font-medium">
                    ${calculations.tax.toLocaleString('zh-TW', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-xl font-bold">含稅總額：</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${calculations.total.toLocaleString('zh-TW', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* 未稅模式：未稅合計＝應付總額 */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">未稅合計：</span>
                  <span className="text-lg font-medium">
                    ${calculations.subtotalAfterTax.toLocaleString('zh-TW', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-xl font-bold">應付總額：</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${calculations.total.toLocaleString('zh-TW', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 備註區塊 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>備註</CardTitle>
            <ConfigValueSelector
              configKey="notes"
              configValue={config?.notes}
              currentValue={currentQuotation.notes}
              onSelect={(value) => updateNotes(String(value))}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentQuotation.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateNotes(e.target.value)}
            placeholder="請填寫匯款資訊、條款或其他備註..."
            className="min-h-[120px] export-hide-border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
