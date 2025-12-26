import { useQuotationStore } from '@/stores/quotationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { exportToImage, exportToPDF, exportToExcel } from '@/utils/exportHandler';
import { Image, FileText, FileSpreadsheet } from 'lucide-react';

interface ExportButtonsProps {
  exportRef: React.RefObject<HTMLDivElement | null>;
}

export function ExportButtons({ exportRef }: ExportButtonsProps) {
  const { currentQuotation, saveToHistory } = useQuotationStore();

  if (!currentQuotation) return null;

  const handleExport = async (
    type: 'image' | 'pdf' | 'excel',
    exportFn: (elementOrQuotation: HTMLElement | any, filename: string) => Promise<void>
  ) => {
    if (!exportRef.current) return;

    try {
      // 先儲存到歷史
      saveToHistory();

      const filename = currentQuotation.quotationNumber || currentQuotation.title || '報價單';
      
      if (type === 'excel') {
        await exportFn(currentQuotation, filename);
      } else {
        await exportFn(exportRef.current, filename);
      }
    } catch (error) {
      alert('匯出失敗，請稍後再試');
      console.error('Export error:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => handleExport('image', exportToImage)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            匯出 JPG
          </Button>
          <Button
            onClick={() => handleExport('pdf', exportToPDF)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            匯出 PDF
          </Button>
          <Button
            onClick={() => handleExport('excel', exportToExcel)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            匯出 Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

