import { useQuotationStore } from '@/stores/quotationStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, GripVertical } from 'lucide-react';
import { useMemo } from 'react';

interface SortableItemProps {
  id: string;
  item: {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  };
  onUpdate: (id: string, updates: Partial<SortableItemProps['item']>) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ id, item, onUpdate, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 ${
        isDragging ? 'shadow-lg border-blue-500' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* 拖曳把手 */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 export-hide"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* 表單內容 */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">項目名稱</label>
            <Input
              value={item.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(id, { name: e.target.value })}
              placeholder="項目名稱"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">規格/描述</label>
            <Input
              value={item.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(id, { description: e.target.value })}
              placeholder="規格或描述"
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">數量</label>
            <Input
              type="number"
              min="0"
              step="1"
              value={item.quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const quantity = parseFloat(e.target.value) || 0;
                onUpdate(id, { quantity });
              }}
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">單價</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unitPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const unitPrice = parseFloat(e.target.value) || 0;
                onUpdate(id, { unitPrice });
              }}
              className="export-hide-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">小計</label>
            <div className="flex items-center gap-2">
              <Input
                value={item.subtotal.toLocaleString('zh-TW', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
                readOnly
                className="export-hide-border bg-gray-50"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onDelete(id)}
                className="export-hide text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ItemsTable() {
  const { currentQuotation, addLineItem, updateLineItem, deleteLineItem, reorderItems } =
    useQuotationStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemIds = useMemo(
    () => currentQuotation?.items.map((item) => item.id) || [],
    [currentQuotation?.items]
  );

  if (!currentQuotation) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);
      reorderItems(oldIndex, newIndex);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 桌面版表格標題 */}
          <div className="hidden md:grid grid-cols-6 gap-4 pb-2 border-b">
            <div className="col-span-1"></div>
            <div className="font-medium text-gray-700">項目名稱</div>
            <div className="font-medium text-gray-700">規格/描述</div>
            <div className="font-medium text-gray-700">數量</div>
            <div className="font-medium text-gray-700">單價</div>
            <div className="font-medium text-gray-700">小計</div>
          </div>

          {/* 拖曳排序容器 */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {currentQuotation.items.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    onUpdate={updateLineItem}
                    onDelete={deleteLineItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* 新增按鈕 */}
          <Button
            type="button"
            onClick={addLineItem}
            variant="outline"
            className="w-full export-hide"
          >
            + 新增一行
          </Button>

          {currentQuotation.items.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              尚無報價項目，請點擊「新增一行」開始新增
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

