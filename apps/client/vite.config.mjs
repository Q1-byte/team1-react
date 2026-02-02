import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @trip/ui 임포트 시 실제 물리적 위치로 연결
      "@trip/ui": path.resolve(__dirname, "../../packages/ui/index.jsx"),
    },
    preserveSymlinks: true
  }
})
