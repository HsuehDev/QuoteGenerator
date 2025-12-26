import { useState, useEffect, useRef } from 'react';
import { useConfigStore } from '@/stores/configStore';
import { useQuotationStore } from '@/stores/quotationStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Settings, Download, Upload, Trash2, Check, Plus, X } from 'lucide-react';
import { exportConfig, importConfig } from '@/utils/configManager';
import type { TaxCalculationMode } from '@/types/quotation';
import { MultiOptionField } from '@/components/MultiOptionField';

export function ConfigManager() {
  const { config, loadConfig, updateConfig, deleteConfig } = useConfigStore();
  const { currentQuotation, updateQuotation, updateClientInfo, updateProviderInfo, updateTaxConfig, updateNotes } = useQuotationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(config || {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // 當 drawer 打開時，初始化 localConfig
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // 當 drawer 打開時，從 config 初始化 localConfig
      setLocalConfig(config || {});
    }
  };

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

    if (config.title && config.title.length > 0) {
      updateQuotation({ title: config.title[0] });
    }
    if (config.subtitle && config.subtitle.length > 0) {
      updateQuotation({ subtitle: config.subtitle[0] });
    }
    if (config.client) {
      const clientInfo: Partial<import('@/types/quotation').ClientInfo> = {};
      if (config.client.companyName && config.client.companyName.length > 0) {
        clientInfo.companyName = config.client.companyName[0];
      }
      if (config.client.contactPerson && config.client.contactPerson.length > 0) {
        clientInfo.contactPerson = config.client.contactPerson[0];
      }
      if (config.client.phone && config.client.phone.length > 0) {
        clientInfo.phone = config.client.phone[0];
      }
      if (config.client.email && config.client.email.length > 0) {
        clientInfo.email = config.client.email[0];
      }
      if (config.client.address && config.client.address.length > 0) {
        clientInfo.address = config.client.address[0];
      }
      if (config.client.logo) {
        clientInfo.logo = config.client.logo;
      }
      updateClientInfo(clientInfo);
    }
    if (config.provider) {
      const providerInfo: Partial<import('@/types/quotation').ProviderInfo> = {};
      if (config.provider.companyName && config.provider.companyName.length > 0) {
        providerInfo.companyName = config.provider.companyName[0];
      }
      if (config.provider.brandName && config.provider.brandName.length > 0) {
        providerInfo.brandName = config.provider.brandName[0];
      }
      if (config.provider.contactPerson && config.provider.contactPerson.length > 0) {
        providerInfo.contactPerson = config.provider.contactPerson[0];
      }
      if (config.provider.phone && config.provider.phone.length > 0) {
        providerInfo.phone = config.provider.phone[0];
      }
      if (config.provider.email && config.provider.email.length > 0) {
        providerInfo.email = config.provider.email[0];
      }
      if (config.provider.address && config.provider.address.length > 0) {
        providerInfo.address = config.provider.address[0];
      }
      if (config.provider.taxId && config.provider.taxId.length > 0) {
        providerInfo.taxId = config.provider.taxId[0];
      }
      if (config.provider.logo) {
        providerInfo.logo = config.provider.logo;
      }
      if (config.provider.stamp) {
        providerInfo.stamp = config.provider.stamp;
      }
      updateProviderInfo(providerInfo);
    }
    if (config.taxConfig) {
      const taxInfo: Partial<import('@/types/quotation').TaxConfig> = {};
      if (config.taxConfig.name && config.taxConfig.name.length > 0) {
        taxInfo.name = config.taxConfig.name[0];
      }
      if (config.taxConfig.rate && config.taxConfig.rate.length > 0) {
        taxInfo.rate = config.taxConfig.rate[0];
      }
      if (config.taxConfig.mode && config.taxConfig.mode.length > 0) {
        taxInfo.mode = config.taxConfig.mode[0] as TaxCalculationMode;
      }
      updateTaxConfig(taxInfo);
    }
    if (config.notes && config.notes.length > 0) {
      updateNotes(config.notes[0]);
    }
    if (config.showSignatureSection !== undefined) {
      updateQuotation({ showSignatureSection: config.showSignatureSection });
    }

    setIsOpen(false);
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
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
                  <MultiOptionField
                    label="報價單標題"
                    values={localConfig.title || []}
                    onChange={(values) => setLocalConfig({ ...localConfig, title: values })}
                    placeholder="專案報價單"
                  />
                  <MultiOptionField
                    label="副標題"
                    values={localConfig.subtitle || []}
                    onChange={(values) => setLocalConfig({ ...localConfig, subtitle: values })}
                    placeholder="QUOTATION"
                  />
                </CardContent>
              </Card>

              {/* 客戶資訊 */}
              <Card>
                <CardHeader>
                  <CardTitle>客戶資訊</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MultiOptionField
                    label="公司名稱"
                    values={localConfig.client?.companyName || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      client: { ...localConfig.client, companyName: values }
                    })}
                    placeholder="客戶公司名稱"
                  />
                  <MultiOptionField
                    label="聯絡人"
                    values={localConfig.client?.contactPerson || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      client: { ...localConfig.client, contactPerson: values }
                    })}
                    placeholder="聯絡人姓名"
                  />
                  <MultiOptionField
                    label="電話"
                    values={localConfig.client?.phone || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      client: { ...localConfig.client, phone: values }
                    })}
                    placeholder="02-1234-5678"
                  />
                  <MultiOptionField
                    label="Email"
                    values={localConfig.client?.email || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      client: { ...localConfig.client, email: values }
                    })}
                    placeholder="example@company.com"
                  />
                  <MultiOptionField
                    label="地址"
                    values={localConfig.client?.address || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      client: { ...localConfig.client, address: values }
                    })}
                    placeholder="公司地址"
                  />
                </CardContent>
              </Card>

              {/* 服務提供方資訊 */}
              <Card>
                <CardHeader>
                  <CardTitle>服務提供方</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MultiOptionField
                    label="公司名稱"
                    values={localConfig.provider?.companyName || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      provider: { ...localConfig.provider, companyName: values }
                    })}
                    placeholder="服務提供方公司名稱"
                  />
                  <MultiOptionField
                    label="品牌名稱"
                    values={localConfig.provider?.brandName || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      provider: { ...localConfig.provider, brandName: values }
                    })}
                    placeholder="品牌名稱"
                  />
                  <MultiOptionField
                    label="聯絡人"
                    values={localConfig.provider?.contactPerson || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      provider: { ...localConfig.provider, contactPerson: values }
                    })}
                    placeholder="聯絡人姓名"
                  />
                  <MultiOptionField
                    label="電話"
                    values={localConfig.provider?.phone || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      provider: { ...localConfig.provider, phone: values }
                    })}
                    placeholder="02-1234-5678"
                  />
                  <MultiOptionField
                    label="Email"
                    values={localConfig.provider?.email || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      provider: { ...localConfig.provider, email: values }
                    })}
                    placeholder="example@company.com"
                  />
                  <MultiOptionField
                    label="地址"
                    values={localConfig.provider?.address || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      provider: { ...localConfig.provider, address: values }
                    })}
                    placeholder="公司地址"
                  />
                  <MultiOptionField
                    label="統一編號"
                    values={localConfig.provider?.taxId || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      provider: { ...localConfig.provider, taxId: values }
                    })}
                    placeholder="統一編號"
                  />
                </CardContent>
              </Card>

              {/* 稅率設定 */}
              <Card>
                <CardHeader>
                  <CardTitle>稅率設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MultiOptionField
                    label="稅目名稱"
                    values={localConfig.taxConfig?.name || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      taxConfig: { ...localConfig.taxConfig, name: values }
                    })}
                    placeholder="營業稅"
                  />
                  <MultiOptionField
                    label="稅率 (%)"
                    values={localConfig.taxConfig?.rate?.map(r => String(r)) || []}
                    onChange={(values) => setLocalConfig({
                      ...localConfig,
                      taxConfig: { 
                        ...localConfig.taxConfig, 
                        rate: values.map(v => parseFloat(v) || 0).filter(v => !isNaN(v))
                      }
                    })}
                    placeholder="5"
                    type="number"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="config-tax-mode">計算方式</Label>
                    <div className="space-y-2">
                      {(!localConfig.taxConfig?.mode || localConfig.taxConfig.mode.length === 0) && (
                        <div className="text-sm text-gray-500 italic">尚無選項，點擊「新增」按鈕添加</div>
                      )}
                      {(localConfig.taxConfig?.mode || []).map((mode, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Select
                            value={mode}
                            onValueChange={(value) => {
                              const newModes = [...(localConfig.taxConfig?.mode || [])];
                              newModes[index] = value;
                              setLocalConfig({
                                ...localConfig,
                                taxConfig: { ...localConfig.taxConfig, mode: newModes }
                              });
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">未稅（0%）</SelectItem>
                              <SelectItem value="included">含稅（內含）</SelectItem>
                              <SelectItem value="excluded">外加稅（加在未稅上）</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newModes = (localConfig.taxConfig?.mode || []).filter((_, i) => i !== index);
                              setLocalConfig({
                                ...localConfig,
                                taxConfig: { ...localConfig.taxConfig, mode: newModes }
                              });
                            }}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newModes = [...(localConfig.taxConfig?.mode || []), 'excluded'];
                          setLocalConfig({
                            ...localConfig,
                            taxConfig: { ...localConfig.taxConfig, mode: newModes }
                          });
                        }}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        新增
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 其他設定 */}
              <Card>
                <CardHeader>
                  <CardTitle>其他設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MultiOptionField
                    label="備註"
                    values={localConfig.notes || []}
                    onChange={(values) => setLocalConfig({ ...localConfig, notes: values })}
                    placeholder="請填寫匯款資訊、條款或其他備註..."
                  />
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

