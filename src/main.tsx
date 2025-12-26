import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 確保系統固定為 light mode，不受系統色調影響
if (typeof document !== 'undefined') {
  // 移除可能的 dark class
  document.documentElement.classList.remove('dark');
  // 強制設定 color-scheme
  document.documentElement.style.colorScheme = 'light';
  
  // 監聽可能的 class 變化（防止其他程式碼添加 dark class）
  const observer = new MutationObserver(() => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    }
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
