import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url' // 💡 ESM 환경에서 경로 계산을 위해 필요
import path from 'path'

// 💡 ESM 환경에서는 __dirname 변수가 없으므로 직접 정의해야 합니다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 모노레포 내 공통 UI 패키지 경로
      "@trip/ui": path.resolve(__dirname, "../../packages/ui/index.jsx"),
      
      // 💡 의존성 꼬임 방지를 위한 절대 경로 고정
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-router-dom": path.resolve(__dirname, "node_modules/react-router-dom"),
    },
    // 심볼릭 링크를 실제 경로로 해석하지 않도록 설정 (모노레포 필수)
    preserveSymlinks: false 
  },
  // 💡 빌드 및 Babel 캐시 충돌 방지
  optimizeDeps: {
    force: true 
  }
})