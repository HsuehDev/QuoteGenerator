import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfigValueSelectorProps {
  configKey: string;
  configValues: (string | number)[] | undefined;
  currentValue: string | number;
  onSelect: (value: string | number) => void;
  className?: string;
  placeholder?: string;
}

/**
 * 設定檔值選擇器 - 當設定檔有多個選項時，顯示下拉選單讓用戶可以選擇
 */
export function ConfigValueSelector({
  configKey,
  configValues,
  currentValue,
  onSelect,
  className,
  placeholder = '從設定檔選擇...',
}: ConfigValueSelectorProps) {
  // 如果設定檔沒有選項或選項為空，不顯示選擇器
  if (!configValues || configValues.length === 0) {
    return null;
  }

  // 將當前值轉為字串以便比較
  const currentValueStr = String(currentValue);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Sparkles className="h-3 w-3 text-blue-500 flex-shrink-0" />
      <Select
        value={currentValueStr}
        onValueChange={(value) => {
          // 嘗試轉換為數字（如果是數字類型）
          const numValue = Number(value);
          if (!isNaN(numValue) && value !== String(numValue)) {
            onSelect(numValue);
          } else {
            onSelect(value);
          }
        }}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {configValues.map((value, index) => (
            <SelectItem key={`${configKey}-${index}-${value}`} value={String(value)}>
              {String(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

