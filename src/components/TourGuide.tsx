import { useEffect, useRef } from 'react';
import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

// 定義引導步驟
const tourSteps = [
  {
    element: '[data-tour="config-manager"]',
    popover: {
      title: '⚙️ 設定檔管理',
      description: `管理常用設定
（公司資訊、客戶資訊、稅率等）

設定後可在輸入欄位旁的 ✨ 圖示快速選擇`,
      position: 'bottom' as const,
    },
  },
  {
    element: '[data-tour="company-name-input"]',
    popover: {
      title: '📝 輸入欄位',
      description: `直接輸入
或點擊旁邊的 ✨ 圖示從設定檔快速帶入`,
      position: 'right' as const,
    },
  },
  {
    element: '[data-tour="export-buttons"]',
    popover: {
      title: '📤 匯出功能',
      description: `支援 JPG、PDF、Excel 三種格式

匯出時會自動儲存到歷史記錄`,
      position: 'bottom' as const,
    },
  },
  {
    element: '[data-tour="history-button"]',
    popover: {
      title: '📚 歷史記錄',
      description: `自動儲存最近 5 筆報價單

可載入、刪除或建立新報價單`,
      position: 'bottom' as const,
    },
  },
];

const TOUR_COMPLETED_KEY = 'quote-generator-tour-completed';

export function TourGuide() {
  const driverRef = useRef<Driver | null>(null);

  const startTour = () => {
    if (!driverRef.current) return;

    // 等待 DOM 渲染完成
    setTimeout(() => {
      // 檢查所有目標元素是否存在
      const allElementsExist = tourSteps.every((step) => {
        const element = document.querySelector(step.element);
        return element !== null;
      });

      if (!allElementsExist) {
        console.warn('部分引導目標元素未找到，請確保頁面已完全載入');
        // 即使部分元素不存在，也嘗試啟動引導
      }

      // 定義步驟並啟動
      const steps: DriveStep[] = tourSteps.map((step) => ({
        element: step.element,
        popover: {
          title: step.popover.title,
          description: step.popover.description,
          side: step.popover.position,
        },
      }));

      if (driverRef.current) {
        driverRef.current.setSteps(steps);
        driverRef.current.drive();
      }
    }, 100);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
  };

  const hasCompletedTour = () => {
    return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
  };

  useEffect(() => {
    // 初始化 driver.js
    driverRef.current = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      doneBtnText: '完成',
      nextBtnText: '下一步',
      prevBtnText: '上一步',
      stagePadding: 4,
      stageRadius: 4,
      allowClose: true,
      overlayOpacity: 0.75,
      smoothScroll: true,
      animate: true,
      onDestroyed: () => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      },
    });

    // 首次訪問時自動啟動
    const shouldAutoStart = !hasCompletedTour();
    if (shouldAutoStart) {
      // 延遲啟動，確保頁面已完全載入
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      
      return () => {
        clearTimeout(timer);
        if (driverRef.current) {
          driverRef.current.destroy();
        }
      };
    }

    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        resetTour();
        startTour();
      }}
      className="flex items-center gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      開始引導
    </Button>
  );
}

// 導出啟動函數供外部使用
export const startTourGuide = () => {
  // 這個函數可以在其他地方調用來啟動引導
  const driverObj = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    doneBtnText: '完成',
    nextBtnText: '下一步',
    prevBtnText: '上一步',
    stagePadding: 4,
    stageRadius: 4,
    allowClose: true,
    overlayOpacity: 0.75,
    smoothScroll: true,
    animate: true,
    onDestroyed: () => {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      driverObj.destroy();
    },
  });

  setTimeout(() => {
    const steps: DriveStep[] = tourSteps.map((step) => ({
      element: step.element,
      popover: {
        title: step.popover.title,
        description: step.popover.description,
        side: step.popover.position,
      },
    }));

    driverObj.setSteps(steps);
    driverObj.drive();
  }, 100);
};

