import { useState, useEffect, useRef } from 'react';
import { useConfigStore } from '@/stores/configStore';
import { useQuotationStore } from '@/stores/quotationStore';
import { Button } from '@/components/ui/button';
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Settings, Download, Upload, Trash2, Check } from 'lucide-react';
import { exportConfig, importConfig } from '@/utils/configManager';
import type { TaxCalculationMode } from '@/types/quotation';

export function ConfigManager() {
  const { config, loadConfig, updateConfig, saveConfig, deleteConfig } = useConfigStore();
  const { currentQuotation, updateQuotation, updateClientInfo, updateProviderInfo, updateTaxConfig, updateNotes } = useQuotationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(config || {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleSave = () => {
    updateConfig(localConfig);
    setIsOpen(false);
  };

  const handleExport = () => {
    if (config) {
      exportConfig(config);
    }
  };

  const handleImport = async (file: File) => {
    const importedConfig = await importConfig(file);
    if (importedConfig) {
      updateConfig(importedConfig);
      setLocalConfig(importedConfig);
    }
  };

  const handleDelete = () => {
    if (confirm('確定要刪除設定檔嗎？')) {
      deleteConfig();
      setLocalConfig({});
      setIsOpen(false);
    }
  };

  const applyConfigToQuotation = () => {
    if (!currentQuotation || !config) return;

    if (config.title !== undefined) {
      updateQuotation({ title: config.title });
    }
    if (config.subtitle !== undefined) {
      updateQuotation({ subtitle: config.subtitle });
    }
    if (config.client) {
      updateClientInfo(config.client);
    }
    if (config.provider) {
      updateProviderInfo(config.provider);
    }
    if (config.taxConfig) {
      updateTaxConfig(config.taxConfig);
    }
    if (config.notes !== undefined) {
      updateNotes(config.notes);
    }
    if (config.showSignatureSection !== undefined) {
      updateQuotation({ showSignatureSection: config.showSignatureSection });
    }

    setIsOpen(false);
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            設定檔管理
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>設定檔管理</DrawerTitle>
            <DrawerDescription>
              設定常用的報價單欄位預設值，這些值可以在建立新報價單時自動套用
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-4">
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* 基本資訊 */}
              <Card>
                <CardHeader>
                  <CardTitle>基本資訊</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="config-title">報價單標題</Label>
                    <Input
                      id="config-title"
                      value={localConfig.title || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
                      placeholder="專案報價單"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-subtitle">副標題</Label>
                    <Input
                      id="config-subtitle"
                      value={localConfig.subtitle || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, subtitle: e.target.value })}
                      placeholder="QUOTATION"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 客戶資訊 */}
              <Card>
                <CardHeader>
                  <CardTitle>客戶資訊</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="config-client-company">公司名稱</Label>
                    <Input
                      id="config-client-company"
                      value={localConfig.client?.companyName || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        client: { ...localConfig.client, companyName: e.target.value }
                      })}
                      placeholder="客戶公司名稱"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-client-contact">聯絡人</Label>
                    <Input
                      id="config-client-contact"
                      value={localConfig.client?.contactPerson || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        client: { ...localConfig.client, contactPerson: e.target.value }
                      })}
                      placeholder="聯絡人姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-client-phone">電話</Label>
                    <Input
                      id="config-client-phone"
                      value={localConfig.client?.phone || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        client: { ...localConfig.client, phone: e.target.value }
                      })}
                      placeholder="02-1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-client-email">Email</Label>
                    <Input
                      id="config-client-email"
                      type="email"
                      value={localConfig.client?.email || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        client: { ...localConfig.client, email: e.target.value }
                      })}
                      placeholder="example@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-client-address">地址</Label>
                    <Input
                      id="config-client-address"
                      value={localConfig.client?.address || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        client: { ...localConfig.client, address: e.target.value }
                      })}
                      placeholder="公司地址"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 服務提供方資訊 */}
              <Card>
                <CardHeader>
                  <CardTitle>服務提供方</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="config-provider-company">公司名稱</Label>
                    <Input
                      id="config-provider-company"
                      value={localConfig.provider?.companyName || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        provider: { ...localConfig.provider, companyName: e.target.value }
                      })}
                      placeholder="服務提供方公司名稱"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-provider-brand">品牌名稱</Label>
                    <Input
                      id="config-provider-brand"
                      value={localConfig.provider?.brandName || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        provider: { ...localConfig.provider, brandName: e.target.value }
                      })}
                      placeholder="品牌名稱"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-provider-contact">聯絡人</Label>
                    <Input
                      id="config-provider-contact"
                      value={localConfig.provider?.contactPerson || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        provider: { ...localConfig.provider, contactPerson: e.target.value }
                      })}
                      placeholder="聯絡人姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-provider-phone">電話</Label>
                    <Input
                      id="config-provider-phone"
                      value={localConfig.provider?.phone || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        provider: { ...localConfig.provider, phone: e.target.value }
                      })}
                      placeholder="02-1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-provider-email">Email</Label>
                    <Input
                      id="config-provider-email"
                      type="email"
                      value={localConfig.provider?.email || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        provider: { ...localConfig.provider, email: e.target.value }
                      })}
                      placeholder="example@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-provider-address">地址</Label>
                    <Input
                      id="config-provider-address"
                      value={localConfig.provider?.address || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        provider: { ...localConfig.provider, address: e.target.value }
                      })}
                      placeholder="公司地址"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-provider-taxId">統一編號</Label>
                    <Input
                      id="config-provider-taxId"
                      value={localConfig.provider?.taxId || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        provider: { ...localConfig.provider, taxId: e.target.value }
                      })}
                      placeholder="統一編號"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 稅率設定 */}
              <Card>
                <CardHeader>
                  <CardTitle>稅率設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="config-tax-name">稅目名稱</Label>
                    <Input
                      id="config-tax-name"
                      value={localConfig.taxConfig?.name || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        taxConfig: { ...localConfig.taxConfig, name: e.target.value }
                      })}
                      placeholder="營業稅"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-tax-rate">稅率 (%)</Label>
                    <Input
                      id="config-tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={localConfig.taxConfig?.rate || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        taxConfig: { ...localConfig.taxConfig, rate: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-tax-mode">計算方式</Label>
                    <Select
                      value={localConfig.taxConfig?.mode || 'excluded'}
                      onValueChange={(value) => setLocalConfig({
                        ...localConfig,
                        taxConfig: { ...localConfig.taxConfig, mode: value as TaxCalculationMode }
                      })}
                    >
                      <SelectTrigger id="config-tax-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">未稅（0%）</SelectItem>
                        <SelectItem value="included">含稅（內含）</SelectItem>
                        <SelectItem value="excluded">外加稅（加在未稅上）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* 其他設定 */}
              <Card>
                <CardHeader>
                  <CardTitle>其他設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="config-notes">備註</Label>
                    <Textarea
                      id="config-notes"
                      value={localConfig.notes || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, notes: e.target.value })}
                      placeholder="請填寫匯款資訊、條款或其他備註..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="config-showSignature"
                      checked={localConfig.showSignatureSection !== false}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        showSignatureSection: e.target.checked
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="config-showSignature" className="cursor-pointer">
                      預設顯示簽章區
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <DrawerFooter className="flex-row justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={!config}>
                <Download className="h-4 w-4 mr-2" />
                匯出
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                匯入
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImport(file);
                  }
                }}
              />
              {config && (
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  刪除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {config && currentQuotation && (
                <Button variant="secondary" onClick={applyConfigToQuotation}>
                  <Check className="h-4 w-4 mr-2" />
                  套用到當前報價單
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline">取消</Button>
              </DrawerClose>
              <Button onClick={handleSave}>儲存</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

