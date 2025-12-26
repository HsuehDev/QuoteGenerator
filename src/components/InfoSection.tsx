import { useQuotationStore } from '@/stores/quotationStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convertImageToBase64 } from '@/utils/imageUtils';
import { Upload, X } from 'lucide-react';
import { useRef } from 'react';

export function InfoSection() {
  const { currentQuotation, updateClientInfo, updateProviderInfo } = useQuotationStore();
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
            <Label htmlFor="clientCompanyName">公司名稱</Label>
            <Input
              id="clientCompanyName"
              value={currentQuotation.client.companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInfo({ companyName: e.target.value })}
              placeholder="客戶公司名稱"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientContactPerson">聯絡人</Label>
            <Input
              id="clientContactPerson"
              value={currentQuotation.client.contactPerson}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInfo({ contactPerson: e.target.value })}
              placeholder="聯絡人姓名"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">電話</Label>
            <Input
              id="clientPhone"
              value={currentQuotation.client.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInfo({ phone: e.target.value })}
              placeholder="02-1234-5678"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
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
            <Label htmlFor="clientAddress">地址</Label>
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
            <Label htmlFor="providerCompanyName">公司名稱</Label>
            <Input
              id="providerCompanyName"
              value={currentQuotation.provider.companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ companyName: e.target.value })}
              placeholder="服務提供方公司名稱"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="providerContactPerson">聯絡人</Label>
            <Input
              id="providerContactPerson"
              value={currentQuotation.provider.contactPerson}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ contactPerson: e.target.value })}
              placeholder="聯絡人姓名"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="providerPhone">電話</Label>
            <Input
              id="providerPhone"
              value={currentQuotation.provider.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ phone: e.target.value })}
              placeholder="02-1234-5678"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="providerEmail">Email</Label>
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
            <Label htmlFor="providerAddress">地址</Label>
            <Input
              id="providerAddress"
              value={currentQuotation.provider.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProviderInfo({ address: e.target.value })}
              placeholder="公司地址"
              className="export-hide-border"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

