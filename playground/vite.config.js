import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: {},
    process: {
      env:{

      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
  },

  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => ['rdf-editor'].includes(tag),
      }
    }
  })],
})
