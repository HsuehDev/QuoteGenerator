import { useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: 'default' | 'destructive';
    onConfirm: () => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        title: options.title || '確認',
        message: options.message,
        confirmText: options.confirmText || '確定',
        cancelText: options.cancelText || '取消',
        variant: options.variant || 'default',
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
      });
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (confirmState) {
      setConfirmState(null);
    }
  }, [confirmState]);

  const ConfirmComponent = confirmState ? (
    <ConfirmDialog
      open={confirmState.open}
      title={confirmState.title}
      message={confirmState.message}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      variant={confirmState.variant}
      onConfirm={confirmState.onConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, ConfirmComponent };
}

