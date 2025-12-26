import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quotation, LineItem, ClientInfo, ProviderInfo, TaxConfig } from '@/types/quotation';
import { format } from 'date-fns';
import { loadConfig } from '@/utils/configManager';

interface QuotationStore {
  currentQuotation: Quotation | null;
  history: Quotation[];
  
  // 初始化新報價單
  createQuotation: () => void;
  
  // 更新當前報價單
  updateQuotation: (updates: Partial<Quotation>) => void;
  
  // 載入歷史報價單
  loadQuotation: (id: string) => void;
  
  // 刪除歷史紀錄
  deleteQuotation: (id: string) => void;
  
  // 更新客戶資訊
  updateClientInfo: (client: Partial<ClientInfo>) => void;
  
  // 更新服務提供方資訊
  updateProviderInfo: (provider: Partial<ProviderInfo>) => void;
  
  // 更新稅率設定
  updateTaxConfig: (taxConfig: Partial<TaxConfig>) => void;
  
  // 報價項目操作
  addLineItem: () => void;
  updateLineItem: (id: string, updates: Partial<LineItem>) => void;
  deleteLineItem: (id: string) => void;
  reorderItems: (startIndex: number, endIndex: number) => void;
  
  // 更新備註
  updateNotes: (notes: string) => void;
  
  // 儲存當前報價單到歷史
  saveToHistory: () => void;
}

const createDefaultQuotation = (): Quotation => {
  const now = new Date().toISOString();
  const config = loadConfig();
  
  // 從設定檔載入預設值，如果設定檔有值則使用，否則使用系統預設值
  return {
    id: `quotation-${Date.now()}`,
    title: config?.title || '專案報價單',
    subtitle: config?.subtitle || 'QUOTATION',
    quotationNumber: '',
    quotationDate: format(new Date(), 'yyyy-MM-dd'),
    validUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    client: {
      companyName: config?.client?.companyName || '',
      contactPerson: config?.client?.contactPerson || '',
      phone: config?.client?.phone || '',
      email: config?.client?.email || '',
      address: config?.client?.address || '',
      logo: config?.client?.logo,
    },
    provider: {
      companyName: config?.provider?.companyName || '',
      brandName: config?.provider?.brandName || '',
      contactPerson: config?.provider?.contactPerson || '',
      phone: config?.provider?.phone || '',
      email: config?.provider?.email || '',
      address: config?.provider?.address || '',
      taxId: config?.provider?.taxId || '',
      logo: config?.provider?.logo,
      stamp: config?.provider?.stamp,
    },
    items: [],
    taxConfig: {
      name: config?.taxConfig?.name || '營業稅',
      rate: config?.taxConfig?.rate ?? 5,
      mode: config?.taxConfig?.mode || 'excluded', // 預設為外加
    },
    notes: config?.notes || '',
    showSignatureSection: config?.showSignatureSection !== undefined ? config.showSignatureSection : true, // 預設顯示簽章區
    createdAt: now,
    updatedAt: now,
  };
};

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      currentQuotation: null,
      history: [],

      createQuotation: () => {
        const newQuotation = createDefaultQuotation();
        set({ currentQuotation: newQuotation });
      },

      updateQuotation: (updates) => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        set({
          currentQuotation: {
            ...currentQuotation,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      loadQuotation: (id) => {
        const { history } = get();
        const quotation = history.find((q) => q.id === id);
        if (quotation) {
          // 確保舊資料有 mode 欄位和 showSignatureSection 欄位
          const updatedQuotation = {
            ...quotation,
            taxConfig: {
              ...quotation.taxConfig,
              mode: quotation.taxConfig.mode || 'excluded' as const,
            },
            showSignatureSection: quotation.showSignatureSection !== undefined ? quotation.showSignatureSection : true,
          };
          set({ currentQuotation: updatedQuotation });
        }
      },

      deleteQuotation: (id) => {
        const { history, currentQuotation } = get();
        const newHistory = history.filter((q) => q.id !== id);
        
        // 如果刪除的是當前報價單，清空當前報價單
        if (currentQuotation?.id === id) {
          set({ currentQuotation: null, history: newHistory });
        } else {
          set({ history: newHistory });
        }
      },

      updateClientInfo: (client) => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        set({
          currentQuotation: {
            ...currentQuotation,
            client: {
              ...currentQuotation.client,
              ...client,
            },
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateProviderInfo: (provider) => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        set({
          currentQuotation: {
            ...currentQuotation,
            provider: {
              ...currentQuotation.provider,
              ...provider,
            },
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateTaxConfig: (taxConfig) => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        set({
          currentQuotation: {
            ...currentQuotation,
            taxConfig: {
              ...currentQuotation.taxConfig,
              ...taxConfig,
            },
            updatedAt: new Date().toISOString(),
          },
        });
      },

      addLineItem: () => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        const newItem: LineItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          name: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          subtotal: 0,
        };
        
        set({
          currentQuotation: {
            ...currentQuotation,
            items: [...currentQuotation.items, newItem],
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateLineItem: (id, updates) => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        const items = currentQuotation.items.map((item) => {
          if (item.id === id) {
            const updated = { ...item, ...updates };
            // 自動計算小計
            updated.subtotal = updated.quantity * updated.unitPrice;
            return updated;
          }
          return item;
        });
        
        set({
          currentQuotation: {
            ...currentQuotation,
            items,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      deleteLineItem: (id) => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        set({
          currentQuotation: {
            ...currentQuotation,
            items: currentQuotation.items.filter((item) => item.id !== id),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      reorderItems: (startIndex, endIndex) => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        const items = [...currentQuotation.items];
        const [removed] = items.splice(startIndex, 1);
        items.splice(endIndex, 0, removed);
        
        set({
          currentQuotation: {
            ...currentQuotation,
            items,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateNotes: (notes) => {
        const { currentQuotation } = get();
        if (!currentQuotation) return;
        
        set({
          currentQuotation: {
            ...currentQuotation,
            notes,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      saveToHistory: () => {
        const { currentQuotation, history } = get();
        if (!currentQuotation) return;
        
        // 檢查是否已存在
        const existingIndex = history.findIndex((q) => q.id === currentQuotation.id);
        
        let newHistory: Quotation[];
        if (existingIndex >= 0) {
          // 更新現有紀錄
          newHistory = [...history];
          newHistory[existingIndex] = { ...currentQuotation };
        } else {
          // 新增紀錄
          newHistory = [currentQuotation, ...history];
        }
        
        // 按更新時間排序，保留最多 5 筆
        newHistory.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        newHistory = newHistory.slice(0, 5);
        
        set({ history: newHistory });
      },
    }),
    {
      name: 'quotation-storage',
      partialize: (state) => ({
        currentQuotation: state.currentQuotation,
        history: state.history,
      }),
    }
  )
);

