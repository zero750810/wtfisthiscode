import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'worker') {
    // Build the Cloudflare Worker entry
    return {
      build: {
        ssr: true,
        outDir: 'dist/worker',
        rollupOptions: {
          input: resolve(__dirname, 'src/server/index.ts'),
          output: {
            entryFileNames: 'index.js',
          },
        },
        minify: true,
      },
      resolve: {
        alias: {
          '@server': resolve(__dirname, 'src/server'),
        },
      },
    }
  }

  // Default: build the Vue frontend
  return {
    plugins: [vue(), tailwindcss()],
    build: {
      outDir: 'dist/client',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/client'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  }
})
