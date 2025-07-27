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
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.html')) {
            return '[name].[ext]'
          }
          return '[name].[ext]'
        },
        inlineDynamicImports: false,
        manualChunks: undefined,
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