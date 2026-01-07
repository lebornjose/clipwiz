import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@van-gogh/wasm-video-adapter'],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd'],
      name: 'VideoRenderer',
      fileName: 'index',
    },
  },
})
