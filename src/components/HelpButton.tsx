import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface HelpButtonProps {
  content: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function HelpButton({ 
  content, 
  className,
  side = 'top',
  align = 'end'
}: HelpButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center justify-center p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            className
          )}
          onClick={(e) => e.stopPropagation()}
          type="button"
          aria-label="顯示說明"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        side={side}
        align={align}
      >
        <div className="space-y-2">{content}</div>
      </PopoverContent>
    </Popover>
  );
}

