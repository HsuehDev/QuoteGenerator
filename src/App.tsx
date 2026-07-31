import { useEffect, useRef } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import { useConfigStore } from '@/stores/configStore';
import { loadFromServer } from '@/utils/persistenceService';
import { QuotationDisplay } from '@/components/QuotationDisplay';
import { ExportButtons } from '@/components/ExportButtons';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { ConfigManager } from '@/components/ConfigManager';
import { TourGuide } from '@/components/TourGuide';
import { ToastContainer } from '@/components/ToastContainer';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

function App() {
  const { currentQuotation, createQuotation } = useQuotationStore();
  const { loadConfig } = useConfigStore();
  const exportRef = useRef<HTMLDivElement | null>(null);

  // 載入設定檔
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // 從 server 載入資料（覆蓋 localStorage，以 server 為準）
  useEffect(() => {
    loadFromServer().then((serverData) => {
      if (!serverData) return;

      const { quotations, config } = serverData;
      const localUpdatedAt = currentQuotation?.updatedAt;
      const serverUpdatedAt = quotations.currentQuotation?.updatedAt;

      // server 有資料且比 localStorage 新，或 localStorage 為空時採用 server 資料
      const shouldHydrate =
        !localUpdatedAt ||
        (serverUpdatedAt && serverUpdatedAt > localUpdatedAt) ||
        quotations.history.length > 0;

      if (shouldHydrate) {
        useQuotationStore.setState({
          currentQuotation: quotations.currentQuotation,
          history: quotations.history,
        });
      }

      if (config) {
        useConfigStore.setState({ config, isConfigLoaded: true });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <h1 className="text-2xl font-semibold text-gray-900">報價單產生器</h1>
          <div className="flex items-center gap-2">
            <TourGuide />
            <ConfigManager />
            <HistoryDrawer />
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <a
                href="https://github.com/HsuehDev/QuoteGenerator"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* 匯出按鈕（固定在頂部） */}
        <div className="mb-6">
          <ExportButtons exportRef={exportRef} />
        </div>

        {/* 報價單內容（用於匯出） */}
        <QuotationDisplay ref={exportRef} />
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
