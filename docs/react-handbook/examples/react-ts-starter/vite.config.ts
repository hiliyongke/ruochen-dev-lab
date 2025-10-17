import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        // 这里可按需自定义 TDesign 主题变量
        modifyVars: {
          // '@btn-height-default': '40px',
        },
        javascriptEnabled: true,
      },
    },
  },
})