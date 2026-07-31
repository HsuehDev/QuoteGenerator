import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface InputWithConfigOptionsProps {
  value: string | number;
  onChange: (value: string) => void;
  configValues?: (string | number)[];
  configKey: string;
  placeholder?: string;
  className?: string;
  onSelect?: (value: string | number) => void;
  type?: string;
  maxLength?: number;
}

/**
 * 帶有設定檔候選選項的輸入欄位
 * 當輸入欄位獲得焦點時，會在旁邊顯示候選選項
 */
export function InputWithConfigOptions({
  value,
  onChange,
  configValues,
  configKey,
  placeholder,
  className,
  onSelect,
  type = 'text',
  maxLength,
}: InputWithConfigOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 如果沒有候選選項，只顯示普通輸入欄位
  if (!configValues || configValues.length === 0) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        maxLength={maxLength}
      />
    );
  }

  const handleMouseEnter = () => {
    if (configValues && configValues.length > 0) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // 清除之前的延遲
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // 延遲關閉，讓滑鼠移動到 Popover 時不會關閉
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handlePopoverMouseEnter = () => {
    // 清除關閉的延遲
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleSelect = (selectedValue: string | number) => {
    onChange(String(selectedValue));
    if (onSelect) {
      onSelect(selectedValue);
    }
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          placeholder={placeholder}
          className={cn(className)}
          maxLength={maxLength}
        />
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-[200px] p-1 max-h-[200px] overflow-y-auto z-50 bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="space-y-1">
          {configValues.map((optionValue, index) => (
            <button
              key={`${configKey}-${index}-${optionValue}`}
              type="button"
              onClick={() => handleSelect(optionValue)}
              onMouseDown={(e) => e.preventDefault()}
              className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 focus:bg-slate-100 focus:outline-none transition-colors"
            >
              {String(optionValue)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

