import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
    hmr:true,
    port:3004,
    proxy:{
      "/api":{
        target:"http://localhost:7070",
        changeOrigin:true,
        cookiePathRewrite:{
          "^api":"/api"
        }
      }
    }
  }
})
