import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

interface MultiOptionFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  type?: 'text' | 'number';
}

/**
 * 多選項欄位組件 - 用於管理多個選項的列表
 */
export function MultiOptionField({
  label,
  values,
  onChange,
  placeholder = '輸入值...',
  type = 'text',
}: MultiOptionFieldProps) {
  const addOption = () => {
    onChange([...values, '']);
  };

  const removeOption = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const updateOption = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          新增
        </Button>
      </div>
      <div className="space-y-2">
        {values.length === 0 ? (
          <div className="text-sm text-gray-500 italic">尚無選項，點擊「新增」按鈕添加</div>
        ) : (
          values.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type={type}
                value={value}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={placeholder}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
                className="h-8 w-8 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

