import { useQuotationStore } from '@/stores/quotationStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function HeaderSection() {
  const { currentQuotation, updateQuotation } = useQuotationStore();

  if (!currentQuotation) return null;

  const quotationDate = currentQuotation.quotationDate 
    ? new Date(currentQuotation.quotationDate) 
    : new Date();
  const validUntil = currentQuotation.validUntil 
    ? new Date(currentQuotation.validUntil) 
    : new Date();

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">報價單標題</Label>
          <Input
            id="title"
            value={currentQuotation.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuotation({ title: e.target.value })}
            placeholder="報價單"
            className="export-hide-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quotationNumber">報價單編號</Label>
          <Input
            id="quotationNumber"
            value={currentQuotation.quotationNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuotation({ quotationNumber: e.target.value })}
            placeholder="QUO-2024-001"
            className="export-hide-border"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>報價日期</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal export-hide-border"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(quotationDate, 'yyyy-MM-dd', { locale: zhTW })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={quotationDate}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    updateQuotation({ quotationDate: format(date, 'yyyy-MM-dd') });
                  }
                }}
                locale={zhTW}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>有效日期</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal export-hide-border"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(validUntil, 'yyyy-MM-dd', { locale: zhTW })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={validUntil}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    updateQuotation({ validUntil: format(date, 'yyyy-MM-dd') });
                  }
                }}
                locale={zhTW}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

