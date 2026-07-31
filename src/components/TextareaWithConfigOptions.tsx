import { useState, useRef } from 'react';
import { AutoResizeTextarea } from '@/components/AutoResizeTextarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TextareaWithConfigOptionsProps {
  value: string;
  onChange: (value: string) => void;
  configValues?: (string | number)[];
  configKey: string;
  placeholder?: string;
  className?: string;
  onSelect?: (value: string | number) => void;
  rows?: number;
  maxLength?: number;
}

/**
 * 帶有設定檔候選選項的文字區域
 * 當文字區域獲得焦點時，會在旁邊顯示候選選項
 */
export function TextareaWithConfigOptions({
  value,
  onChange,
  configValues,
  configKey,
  placeholder,
  className,
  onSelect,
  rows = 4,
  maxLength,
}: TextareaWithConfigOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 如果沒有候選選項，只顯示普通文字區域
  if (!configValues || configValues.length === 0) {
    return (
      <AutoResizeTextarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        rows={rows}
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
    textareaRef.current?.focus();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex-1">
          <AutoResizeTextarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            placeholder={placeholder}
            className={cn(className)}
            rows={rows}
            maxLength={maxLength}
          />
        </div>
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

