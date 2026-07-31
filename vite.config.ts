import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // 對應 docker-compose 的 api 服務（server/index.js, port 3001）
      // 本機開發時先啟動 API：node server/index.js
      '/api': 'http://localhost:3001',
    },
  },
})
