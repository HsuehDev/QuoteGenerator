import { useConfigStore } from '@/stores/configStore';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfigValueSelectorProps {
  configKey: string;
  configValue: string | number | undefined;
  currentValue: string | number;
  onSelect: (value: string | number) => void;
  className?: string;
}

/**
 * 設定檔值選擇器 - 當設定檔有值時，顯示一個按鈕讓用戶可以快速套用設定檔的值
 */
export function ConfigValueSelector({
  configKey,
  configValue,
  currentValue,
  onSelect,
  className,
}: ConfigValueSelectorProps) {
  const { config } = useConfigStore();

  // 如果設定檔沒有這個值，不顯示按鈕
  if (configValue === undefined || configValue === null || (typeof configValue === 'string' && configValue === '')) {
    return null;
  }

  // 如果當前值已經等於設定檔的值，也不顯示按鈕
  // 使用寬鬆比較以處理數字和字串的比較
  if (String(currentValue) === String(configValue)) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-6 w-6 p-0', className)}
      onClick={() => onSelect(configValue)}
      title={`使用設定檔的值: ${configValue}`}
    >
      <Sparkles className="h-3 w-3 text-blue-500" />
    </Button>
  );
}

