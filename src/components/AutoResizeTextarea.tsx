import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

type AutoResizeTextareaProps = React.ComponentProps<typeof Textarea>;

/**
 * 依內容自動長高的 Textarea。
 * 讓編輯畫面完整顯示長描述/備註，與匯出結果一致（所見即所得）。
 */
export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ value, ...props }, outerRef) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(outerRef, () => innerRef.current as HTMLTextAreaElement);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [value]);

    return <Textarea ref={innerRef} value={value} {...props} />;
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
