import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, Check } from 'lucide-react';
import { toast } from '@/components/ToastContainer';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  filename: string;
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  filename,
}: ImagePreviewDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // 將 base64 圖片轉換為 blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // 使用 Clipboard API 複製圖片
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback: 如果瀏覽器不支持 ClipboardItem，提示用戶
        toast.info('您的瀏覽器不支援直接複製圖片，請使用下載功能');
      }
    } catch (error) {
      console.error('複製圖片失敗:', error);
      toast.error('複製圖片失敗，請稍後再試');
    }
  };

  const handleDownload = () => {
    const extension = imageUrl.startsWith('data:image/png') ? 'png' : 'jpg';
    const link = document.createElement('a');
    link.download = `${filename}.${extension}`;
    link.href = imageUrl;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>圖片預覽</DialogTitle>
          <DialogDescription>
            請選擇要複製圖片到剪貼簿或下載圖片
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* items-start：超高圖片用 items-center 垂直置中會讓頂部溢出到捲動範圍外，永遠看不到 */}
          <div className="flex justify-center items-start bg-gray-100 rounded-lg p-4 max-h-[calc(90vh-250px)] overflow-auto">
            <img
              src={imageUrl}
              alt="預覽"
              className="max-w-full max-h-full w-auto h-auto object-contain rounded"
            />
          </div>
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  已複製
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  複製圖片
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              下載圖片
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

