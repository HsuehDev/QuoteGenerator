import { useQuotationStore } from '@/stores/quotationStore';
import { useConfigStore } from '@/stores/configStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convertImageToBase64 } from '@/utils/imageUtils';
import { Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { ConfigValueSelector } from '@/components/ConfigValueSelector';

export function InfoSection() {
  const { currentQuotation, updateClientInfo, updateProviderInfo } = useQuotationStore();
  const { config } = useConfigStore();
  const clientLogoInputRef = useRef<HTMLInputElement>(null);
  const providerLogoInputRef = useRef<HTMLInputElement>(null);
  const providerStampInputRef = useRef<HTMLInputElement>(null);

  if (!currentQuotation) return null;

  const handleImageUpload = async (
    file: File | null,
    type: 'clientLogo' | 'providerLogo' | 'providerStamp'
  ) => {
    if (!file) return;

    try {
      const base64 = await convertImageToBase64(file);
      
      if (type === 'clientLogo') {
        updateClientInfo({ logo: base64 });
      } else if (type === 'providerLogo') {
        updateProviderInfo({ logo: base64 });
      } else if (type === 'providerStamp') {
        updateProviderInfo({ stamp: base64 });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '上傳圖片失敗');
    }
  };

  const removeImage = (type: 'clientLogo' | 'providerLogo' | 'providerStamp') => {
    if (type === 'clientLogo') {
      updateClientInfo({ logo: undefined });
    } else if (type === 'providerLogo') {
      updateProviderInfo({ logo: undefined });
    } else if (type === 'providerStamp') {
      updateProviderInfo({ stamp: undefined });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 客戶資訊 */}
      <Card>
        <CardHeader>
          <CardTitle>客戶資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo 上傳 */}
          <div className="space-y-2">
            <Label>客戶 Logo</Label>
            <div className="flex items-center gap-4">
              {currentQuotation.client.logo ? (
                <div className="relative">
                  <img
                    src={currentQuotation.client.logo}
                    alt="客戶 Logo"
                    className="h-20 w-20 object-contain border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('clientLogo')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 export-hide"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => clientLogoInputRef.current?.click()}
                  className="flex items-center justify-center h-20 w-20 border-2 border-dashed rounded hover:bg-gray-50 export-hide"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                </button>
              )}
              <input
                ref={clientLogoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, 'clientLogo');
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="clientCompanyName">公司名稱</Label>
              <ConfigValueSelector
                configKey="client.companyName"
                configValue={config?.client?.companyName}
                currentValue={currentQuotation.client.companyName}
                onSelect={(value) => updateClientInfo({ companyName: String(value) })}
              />
            </div>
            <Input
              id="clientCompanyName"
              value={currentQuotation.client.companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInfo({ companyName: e.target.value })}
              placeholder="客戶公司名稱"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="clientContactPerson">聯絡人</Label>
              <ConfigValueSelector
                configKey="client.contactPerson"
                configValue={config?.client?.contactPerson}
                currentValue={currentQuotation.client.contactPerson}
                onSelect={(value) => updateClientInfo({ contactPerson: String(value) })}
              />
            </div>
            <Input
              id="clientContactPerson"
              value={currentQuotation.client.contactPerson}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInfo({ contactPerson: e.target.value })}
              placeholder="聯絡人姓名"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="clientPhone">電話</Label>
              <ConfigValueSelector
                configKey="client.phone"
                configValue={config?.client?.phone}
                currentValue={currentQuotation.client.phone}
                onSelect={(value) => updateClientInfo({ phone: String(value) })}
              />
            </div>
            <Input
              id="clientPhone"
              value={currentQuotation.client.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInfo({ phone: e.target.value })}
              placeholder="02-1234-5678"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="clientEmail">Email</Label>
              <ConfigValueSelector
                configKey="client.email"
                configValue={config?.client?.email}
                currentValue={currentQuotation.client.email}
                onSelect={(value) => updateClientInfo({ email: String(value) })}
              />
            </div>
            <Input
              id="clientEmail"
              type="email"
              value={currentQuotation.client.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInfo({ email: e.target.value })}
              placeholder="example@company.com"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="clientAddress">地址</Label>
              <ConfigValueSelector
                configKey="client.address"
                configValue={config?.client?.address}
                currentValue={currentQuotation.client.address}
                onSelect={(value) => updateClientInfo({ address: String(value) })}
              />
            </div>
            <Input
              id="clientAddress"
              value={currentQuotation.client.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInfo({ address: e.target.value })}
              placeholder="公司地址"
              className="export-hide-border"
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
          {/* Logo 上傳 */}
          <div className="space-y-2">
            <Label>公司 Logo</Label>
            <div className="flex items-center gap-4">
              {currentQuotation.provider.logo ? (
                <div className="relative">
                  <img
                    src={currentQuotation.provider.logo}
                    alt="公司 Logo"
                    className="h-20 w-20 object-contain border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('providerLogo')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 export-hide"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => providerLogoInputRef.current?.click()}
                  className="flex items-center justify-center h-20 w-20 border-2 border-dashed rounded hover:bg-gray-50 export-hide"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                </button>
              )}
              <input
                ref={providerLogoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, 'providerLogo');
                  }
                }}
              />
            </div>
          </div>

          {/* 發票章/公司章上傳 */}
          <div className="space-y-2">
            <Label>發票章/公司章</Label>
            <div className="flex items-center gap-4">
              {currentQuotation.provider.stamp ? (
                <div className="relative">
                  <img
                    src={currentQuotation.provider.stamp}
                    alt="發票章"
                    className="h-20 w-20 object-contain border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('providerStamp')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 export-hide"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => providerStampInputRef.current?.click()}
                  className="flex items-center justify-center h-20 w-20 border-2 border-dashed rounded hover:bg-gray-50 export-hide"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                </button>
              )}
              <input
                ref={providerStampInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, 'providerStamp');
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="providerCompanyName">公司名稱</Label>
              <ConfigValueSelector
                configKey="provider.companyName"
                configValue={config?.provider?.companyName}
                currentValue={currentQuotation.provider.companyName}
                onSelect={(value) => updateProviderInfo({ companyName: String(value) })}
              />
            </div>
            <Input
              id="providerCompanyName"
              value={currentQuotation.provider.companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ companyName: e.target.value })}
              placeholder="服務提供方公司名稱"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="providerBrandName">品牌名稱</Label>
              <ConfigValueSelector
                configKey="provider.brandName"
                configValue={config?.provider?.brandName}
                currentValue={currentQuotation.provider.brandName || ''}
                onSelect={(value) => updateProviderInfo({ brandName: String(value) })}
              />
            </div>
            <Input
              id="providerBrandName"
              value={currentQuotation.provider.brandName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ brandName: e.target.value })}
              placeholder="品牌名稱"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="providerContactPerson">聯絡人</Label>
              <ConfigValueSelector
                configKey="provider.contactPerson"
                configValue={config?.provider?.contactPerson}
                currentValue={currentQuotation.provider.contactPerson}
                onSelect={(value) => updateProviderInfo({ contactPerson: String(value) })}
              />
            </div>
            <Input
              id="providerContactPerson"
              value={currentQuotation.provider.contactPerson}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ contactPerson: e.target.value })}
              placeholder="聯絡人姓名"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="providerPhone">電話</Label>
              <ConfigValueSelector
                configKey="provider.phone"
                configValue={config?.provider?.phone}
                currentValue={currentQuotation.provider.phone}
                onSelect={(value) => updateProviderInfo({ phone: String(value) })}
              />
            </div>
            <Input
              id="providerPhone"
              value={currentQuotation.provider.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ phone: e.target.value })}
              placeholder="02-1234-5678"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="providerEmail">Email</Label>
              <ConfigValueSelector
                configKey="provider.email"
                configValue={config?.provider?.email}
                currentValue={currentQuotation.provider.email}
                onSelect={(value) => updateProviderInfo({ email: String(value) })}
              />
            </div>
            <Input
              id="providerEmail"
              type="email"
              value={currentQuotation.provider.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ email: e.target.value })}
              placeholder="example@company.com"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="providerAddress">地址</Label>
              <ConfigValueSelector
                configKey="provider.address"
                configValue={config?.provider?.address}
                currentValue={currentQuotation.provider.address}
                onSelect={(value) => updateProviderInfo({ address: String(value) })}
              />
            </div>
            <Input
              id="providerAddress"
              value={currentQuotation.provider.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ address: e.target.value })}
              placeholder="公司地址"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="providerTaxId">統一編號</Label>
              <ConfigValueSelector
                configKey="provider.taxId"
                configValue={config?.provider?.taxId}
                currentValue={currentQuotation.provider.taxId || ''}
                onSelect={(value) => updateProviderInfo({ taxId: String(value) })}
              />
            </div>
            <Input
              id="providerTaxId"
              value={currentQuotation.provider.taxId || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ taxId: e.target.value })}
              placeholder="統一編號"
              className="export-hide-border"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

