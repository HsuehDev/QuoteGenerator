import { useState } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { exportToPDF, exportToExcel, renderToImageUrl } from '@/utils/exportHandler';
import { Image, FileText, FileSpreadsheet, Save, Loader2 } from 'lucide-react';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';
import { HelpButton } from '@/components/HelpButton';
import { ExportHelpContent } from '@/components/HelpContent';
import { toast } from '@/components/ToastContainer';
import type { Quotation } from '@/types/quotation';

interface ExportButtonsProps {
  exportRef: React.RefObject<HTMLDivElement | null>;
}

type ExportKind = 'image' | 'pdf' | 'excel';

/** 移除檔案系統不允許的字元，避免文件編號/標題中的特殊字元破壞下載檔名 */
function sanitizeFilename(name: string): string {
  const sanitized = name.replace(/[\\/:*?"<>|]/g, '-').trim();
  return sanitized || '報價單';
}

export function ExportButtons({ exportRef }: ExportButtonsProps) {
  const { currentQuotation, saveToHistory } = useQuotationStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewFilename, setPreviewFilename] = useState('');
  const [exporting, setExporting] = useState<ExportKind | null>(null);

  if (!currentQuotation) return null;

  const getFilename = () =>
    sanitizeFilename(currentQuotation.quotationNumber || currentQuotation.title || '報價單');

  const handleExport = async (
    type: 'pdf' | 'excel',
    exportFn: (elementOrQuotation: HTMLElement | Quotation, filename: string) => Promise<void>
  ) => {
    if (!exportRef.current || exporting) return;

    setExporting(type);
    try {
      // 先儲存到歷史
      saveToHistory();

      const filename = getFilename();

      if (type === 'excel') {
        await exportFn(currentQuotation, filename);
      } else {
        await exportFn(exportRef.current, filename);
      }
    } catch (error) {
      toast.error('匯出失敗，請稍後再試');
      console.error('Export error:', error);
    } finally {
      setExporting(null);
    }
  };

  const handleImageExport = async () => {
    if (!exportRef.current || exporting) return;

    setExporting('image');
    try {
      // 先儲存到歷史
      saveToHistory();

      // 渲染圖片並顯示預覽
      const imageUrl = await renderToImageUrl(exportRef.current);
      setPreviewImageUrl(imageUrl);
      setPreviewFilename(getFilename());
      setPreviewOpen(true);
    } catch (error) {
      toast.error('匯出失敗，請稍後再試');
      console.error('Export error:', error);
    } finally {
      setExporting(null);
    }
  };

  const handleSave = () => {
    saveToHistory();
    toast.success('已儲存到歷史記錄');
  };

  return (
    <>
      <Card>
        <CardContent className="p-4" data-tour="export-buttons">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-700">匯出功能</h3>
              <HelpButton
                content={<ExportHelpContent />}
                side="bottom"
                align="start"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                儲存
              </Button>
              <Button
                onClick={handleImageExport}
                disabled={exporting !== null}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                {exporting === 'image' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
                匯出圖片
              </Button>
              <Button
                onClick={() => handleExport('pdf', exportToPDF as (elementOrQuotation: HTMLElement | Quotation, filename: string) => Promise<void>)}
                disabled={exporting !== null}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                {exporting === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                匯出 PDF
              </Button>
              <Button
                onClick={() => handleExport('excel', exportToExcel as (elementOrQuotation: HTMLElement | Quotation, filename: string) => Promise<void>)}
                disabled={exporting !== null}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                {exporting === 'excel' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                匯出 Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        imageUrl={previewImageUrl}
        filename={previewFilename}
      />
    </>
  );
}
