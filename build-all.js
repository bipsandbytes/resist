import { build } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, cpSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Check if development mode is requested
const isDevelopment = process.argv.includes('--mode') && process.argv.includes('development');
const mode = isDevelopment ? 'development' : 'production';
const logLevel = isDevelopment ? 0 : 3; // DEBUG for development, ERROR for production

console.log(`Building in ${mode} mode with log level ${logLevel} (${isDevelopment ? 'DEBUG' : 'WARN'})`);

async function buildEntry(inputFile, outputName, options = {}) {
  console.log(`Building ${inputFile} -> ${outputName}...`);
  
  const tempDir = `dist-temp-${outputName.replace('.js', '')}`;
  
  await build({
    configFile: false,
    mode: mode, // Use the determined mode
    build: {
      outDir: tempDir,
      sourcemap: true,
      minify: !isDevelopment, // Enable minification for production, disable for development
      rollupOptions: {
        input: resolve(__dirname, inputFile),
        output: {
          entryFileNames: outputName,
          chunkFileNames: '[name].js',
          format: options.format || 'iife',
          name: options.format === 'es' ? undefined : 'Resist',
          inlineDynamicImports: options.format === 'es' ? false : true
        },
        external: options.external || []
      },
    },
    define: {
      // Replace __LOG_LEVEL__ with appropriate level based on mode
      __LOG_LEVEL__: logLevel,
    },
  });
  
  // Copy the built file to final dist directory
  // Special handling for settings.js to go into dist/settings/
  const destPath = outputName === 'settings.js' ? 
    resolve(__dirname, 'dist', 'settings', outputName) : 
    resolve(__dirname, 'dist', outputName);
  
  // Ensure parent directory exists
  if (outputName === 'settings.js') {
    mkdirSync(resolve(__dirname, 'dist', 'settings'), { recursive: true });
  }
  
  copyFileSync(resolve(__dirname, tempDir, outputName), destPath);
  
  // Copy any assets directory if it exists (for WASM files, etc.)
  const assetsDir = resolve(__dirname, tempDir, 'assets');
  const destAssetsDir = resolve(__dirname, 'dist', 'assets');
  try {
    mkdirSync(destAssetsDir, { recursive: true });
    cpSync(assetsDir, destAssetsDir, { recursive: true });
    console.log(`✓ Copied assets for ${outputName}`);
  } catch (err) {
    // Assets directory doesn't exist, which is fine
  }
  
  console.log(`✓ Built ${outputName}`);
}

async function buildAll() {
  try {
    // Ensure dist directory exists
    mkdirSync('dist', { recursive: true });
    
    // Build the service worker as ES module
    await buildEntry('src/background-service-worker.ts', 'background-service-worker.js', {
        format: 'es',
        external: []
    });

    // Build other scripts as before
    await buildEntry('src/content.ts', 'content.js');
    await buildEntry('src/popup.ts', 'popup.js');
    await buildEntry('src/settings/settings.ts', 'settings.js');
    await buildEntry('src/nutrition-label.js', 'nutrition-label.js');
    
    // Copy static files
    console.log('Copying static files...');
    copyFileSync(resolve('src/popup.html'), resolve('dist/popup.html'));
    copyFileSync(resolve('src/settings/index.html'), resolve('dist/settings/index.html'));

    cpSync(resolve('src/settings'), resolve('dist/settings'), { recursive: true });
    
    // Copy icon files
    console.log('Copying icon files...');
    mkdirSync(resolve('dist/icons'), { recursive: true });
    copyFileSync(resolve('icons/resist.svg'), resolve('dist/icons/resist.svg'));
    copyFileSync(resolve('icons/resist_icon_16x16.png'), resolve('dist/icons/resist_icon_16x16.png'));
    copyFileSync(resolve('icons/resist_icon_32x32.png'), resolve('dist/icons/resist_icon_32x32.png'));
    copyFileSync(resolve('icons/resist_icon_48x48.png'), resolve('dist/icons/resist_icon_48x48.png'));
    copyFileSync(resolve('icons/resist_icon_128x128.png'), resolve('dist/icons/resist_icon_128x128.png'));
    
    // Copy favicon files
    copyFileSync(resolve('icons/favicon-16x16.png'), resolve('dist/icons/favicon-16x16.png'));
    copyFileSync(resolve('icons/favicon-32x32.png'), resolve('dist/icons/favicon-32x32.png'));
    copyFileSync(resolve('icons/favicon.ico'), resolve('dist/icons/favicon.ico'));
    
    console.log('✓ All builds completed successfully!');
  } catch (error) {
    console.error('Build error:', error);
    process.exit(1);
  }
}

buildAll();