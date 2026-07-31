import { Download, History } from 'lucide-react';

export function FieldHelpContent() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">
        可直接輸入，或點擊 <span className="font-mono bg-blue-100 px-1 rounded">✨</span> 從設定檔快速選擇。
      </p>
    </div>
  );
}

export function ExportHelpContent() {
  return (
    <div className="space-y-1.5 text-xs text-gray-600">
      <div className="flex items-center gap-2 mb-1">
        <Download className="h-3.5 w-3.5 text-blue-600" />
        <span className="font-medium text-gray-900">匯出功能</span>
      </div>
      <div className="space-y-1">
        <div className="whitespace-nowrap"><span className="font-medium text-gray-700">• 匯出圖片：</span>轉換為 PNG 圖片，適合分享或列印</div>
        <div className="whitespace-nowrap"><span className="font-medium text-gray-700">• 匯出 PDF：</span>產生 PDF 檔案，適合正式文件使用</div>
        <div className="whitespace-nowrap"><span className="font-medium text-gray-700">• 匯出 Excel：</span>產生 Excel 檔案，方便後續編輯和計算</div>
      </div>
      <p className="text-gray-500 text-xs mt-1.5">匯出時會自動儲存到歷史記錄</p>
    </div>
  );
}

export function HistoryHelpContent() {
  return (
    <div className="space-y-1.5 text-xs text-gray-600">
      <div className="flex items-center gap-2 mb-1">
        <History className="h-3.5 w-3.5 text-blue-600" />
        <span className="font-medium text-gray-900">歷史記錄功能</span>
      </div>
      <p className="text-xs">系統會自動儲存最近 <span className="font-medium text-gray-700">5 筆</span> 報價單記錄</p>
      <div className="space-y-1">
        <div className="whitespace-nowrap"><span className="font-medium text-gray-700">• 載入：</span>將歷史報價單載入到編輯區</div>
        <div className="whitespace-nowrap"><span className="font-medium text-gray-700">• 刪除：</span>永久刪除該筆記錄</div>
        <div className="whitespace-nowrap"><span className="font-medium text-gray-700">• 建立新報價單：</span>清空當前內容，開始新的報價單</div>
      </div>
      <p className="text-gray-500 text-xs mt-1.5">每次匯出時會自動儲存，您也可以手動儲存</p>
    </div>
  );
}

