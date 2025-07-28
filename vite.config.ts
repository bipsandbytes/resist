import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        popup: resolve(__dirname, 'src/popup.html'),
        settings: resolve(__dirname, 'src/settings.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Use IIFE for content script to avoid ES6 module issues
          if (chunkInfo.name === 'content') {
            return '[name].js'
          }
          return '[name].js'
        },
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.html')) {
            return '[name].[ext]'
          }
          return '[name].[ext]'
        },
        inlineDynamicImports: false,
        manualChunks: (id) => {
          // Put all content script dependencies into one chunk to avoid ES6 imports
          if (id.includes('content.ts') || id.includes('settings.ts')) {
            return 'content'
          }
        },
        format: 'es'
      },
      external: []
    },
  },
  plugins: [
    {
      name: 'copy-files',
      closeBundle() {
        // Copy the JavaScript background script directly without Vite processing
        copyFileSync(resolve('src/background-classification.js'), resolve('dist/background-classification.js'));
      }
    }
  ],
  base: './',
})