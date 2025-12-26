import { useQuotationStore } from '@/stores/quotationStore';
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
import { Button } from '@/components/ui/button';
import { History, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function HistoryDrawer() {
  const { history, loadQuotation, deleteQuotation, createQuotation } = useQuotationStore();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          歷史紀錄
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>報價單歷史紀錄</DrawerTitle>
            <DrawerDescription>
              最近 5 筆報價單，點擊載入或刪除
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                尚無歷史紀錄
              </div>
            ) : (
              history.map((quotation) => (
                <div
                  key={quotation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <h3 className="font-medium">{quotation.title || '報價單'}</h3>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      <div>編號：{quotation.quotationNumber || '未設定'}</div>
                      <div>
                        日期：{format(new Date(quotation.quotationDate), 'yyyy-MM-dd', { locale: zhTW })}
                      </div>
                      <div>
                        更新時間：{format(new Date(quotation.updatedAt), 'yyyy-MM-dd HH:mm', { locale: zhTW })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadQuotation(quotation.id);
                      }}
                    >
                      載入
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('確定要刪除此報價單嗎？')) {
                          deleteQuotation(quotation.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DrawerFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => createQuotation()}
                className="flex-1"
              >
                建立新報價單
              </Button>
              <DrawerClose asChild>
                <Button variant="default" className="flex-1">
                  關閉
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}


