import { useEffect, useRef } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import { QuotationDisplay } from '@/components/QuotationDisplay';
import { ExportButtons } from '@/components/ExportButtons';
import { HistoryDrawer } from '@/components/HistoryDrawer';

function App() {
  const { currentQuotation, createQuotation } = useQuotationStore();
  const exportRef = useRef<HTMLDivElement | null>(null);

  // 如果沒有當前報價單，建立一個新的
  useEffect(() => {
    if (!currentQuotation) {
      createQuotation();
    }
  }, [currentQuotation, createQuotation]);

  if (!currentQuotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 頂部工具列 */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">報價單產生器</h1>
          <HistoryDrawer />
        </div>

        {/* 匯出按鈕（固定在頂部） */}
        <div className="mb-6">
          <ExportButtons exportRef={exportRef} />
        </div>

        {/* 報價單內容（用於匯出） */}
        <div ref={exportRef}>
          <QuotationDisplay />
        </div>
      </div>
    </div>
  );
}

export default App;
