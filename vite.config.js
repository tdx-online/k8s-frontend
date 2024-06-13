import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1', //前端vue项目的IP地址
    port: '5173',  //前端vue项目的端口号
    open: true,  //表示在启动开发服务器时，会自动打开浏览器并访问指定的地址
  }
})