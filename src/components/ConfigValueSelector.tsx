import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfigValueSelectorProps {
  configKey: string;
  configValues: (string | number)[] | undefined;
  currentValue: string | number;
  onSelect: (value: string | number) => void;
  className?: string;
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
}: ConfigValueSelectorProps) {
  // 如果設定檔沒有選項或選項為空，不顯示選擇器
  if (!configValues || configValues.length === 0) {
    return null;
  }

  // 將當前值轉為字串以便比較
  const currentValueStr = String(currentValue);

  return (
    <div className={cn('flex items-center', className)}>
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
        <SelectTrigger className="h-6 w-6 p-0 border-none bg-transparent hover:bg-slate-100 focus:ring-0 focus:ring-offset-0 [&>span]:hidden [&>svg]:hidden">
          <SelectValue />
          <ChevronDown className="h-3 w-3 text-blue-500 flex-shrink-0" />
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

