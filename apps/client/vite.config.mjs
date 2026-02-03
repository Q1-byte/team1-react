import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@trip/ui": path.resolve(__dirname, "../../packages/ui/index.jsx"),
      // 아래 세 줄이 핵심입니다. 라이브러리 경로를 현재 폴더 기준으로 강제 고정합니다.
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-router-dom": path.resolve(__dirname, "node_modules/react-router-dom"),
          
    },
    preserveSymlinks: false // 모노레포의 심볼릭 링크 꼬임 방지
  }
})