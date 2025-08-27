import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig(({ mode }) => {
  // Determine log level based on mode
  const logLevel = mode === 'production' ? 3 : 0; // ERROR for production, DEBUG for development
  const isDevelopment = mode === 'development';
  
  return {
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: false,
      rollupOptions: {
        input: resolve(__dirname, 'src/background-service-worker.ts'), // Build background as IIFE
        output: {
          entryFileNames: 'background-service-worker.js',
          chunkFileNames: '[name].js',
          format: 'iife', // Use IIFE for all Chrome extension scripts
          name: 'Resist',
          inlineDynamicImports: true
        },
        external: []
      },
    },
    define: {
      // Replace __LOG_LEVEL__ with actual log level value at build time
      __LOG_LEVEL__: logLevel,
    },
    plugins: [
      {
        name: 'copy-files',
        closeBundle() {
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
  }
})
