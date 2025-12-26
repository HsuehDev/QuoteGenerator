import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuotationConfig } from '@/types/config';
import { loadConfig, saveConfig, deleteConfig } from '@/utils/configManager';

interface ConfigStore {
  config: QuotationConfig | null;
  isConfigLoaded: boolean;
  
  // 載入設定檔
  loadConfig: () => void;
  
  // 更新設定檔
  updateConfig: (updates: Partial<QuotationConfig>) => void;
  
  // 儲存設定檔
  saveConfig: () => boolean;
  
  // 刪除設定檔
  deleteConfig: () => boolean;
  
  // 重置設定檔
  resetConfig: () => void;
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      config: null,
      isConfigLoaded: false,

      loadConfig: () => {
        const config = loadConfig();
        set({ config, isConfigLoaded: true });
      },

      updateConfig: (updates) => {
        const { config } = get();
        const newConfig = { ...config, ...updates };
        set({ config: newConfig });
        // 自動儲存
        saveConfig(newConfig);
      },

      saveConfig: () => {
        const { config } = get();
        if (!config) return false;
        return saveConfig(config);
      },

      deleteConfig: () => {
        const success = deleteConfig();
        if (success) {
          set({ config: null });
        }
        return success;
      },

      resetConfig: () => {
        set({ config: null });
        deleteConfig();
      },
    }),
    {
      name: 'config-storage',
      partialize: (state) => ({
        config: state.config,
        isConfigLoaded: state.isConfigLoaded,
      }),
    }
  )
);

