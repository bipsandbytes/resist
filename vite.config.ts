import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/background.ts'), // Build background as IIFE
      output: {
        entryFileNames: 'background.js',
        chunkFileNames: '[name].js',
        format: 'iife', // Use IIFE for all Chrome extension scripts
        name: 'Resist',
        inlineDynamicImports: true
      },
      external: []
    },
  },
  plugins: [
    {
      name: 'copy-files',
      closeBundle() {
        // Copy the JavaScript background scripts directly without Vite processing
        copyFileSync(resolve('src/background-classification.js'), resolve('dist/background-classification.js'));
        copyFileSync(resolve('src/background-image-captioning.js'), resolve('dist/background-image-captioning.js'));
        // Copy HTML files directly since they're static assets
        copyFileSync(resolve('src/popup.html'), resolve('dist/popup.html'));
        copyFileSync(resolve('src/settings/index.html'), resolve('dist/settings.html'));
        // Copy icon files
        mkdirSync(resolve('dist/icons'), { recursive: true });
        copyFileSync(resolve('icons/resist.svg'), resolve('dist/icons/resist.svg'));
      }
    }
  ],
  base: './',
})