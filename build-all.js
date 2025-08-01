import { build } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, cpSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildEntry(inputFile, outputName) {
  console.log(`Building ${inputFile} -> ${outputName}...`);
  
  const tempDir = `dist-temp-${outputName.replace('.js', '')}`;
  
  await build({
    configFile: false,
    build: {
      outDir: tempDir,
      sourcemap: true,
      minify: false,
      rollupOptions: {
        input: resolve(__dirname, inputFile),
        output: {
          entryFileNames: outputName,
          chunkFileNames: '[name].js',
          format: 'iife',
          name: 'Resist',
          inlineDynamicImports: true
        },
        external: []
      },
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
  
  console.log(`✓ Built ${outputName}`);
}

async function buildAll() {
  try {
    // Ensure dist directory exists
    mkdirSync('dist', { recursive: true });
    
    // Build each entry point individually
    await buildEntry('src/content.ts', 'content.js');
    await buildEntry('src/popup.ts', 'popup.js');  
    await buildEntry('src/background.ts', 'background.js');
    await buildEntry('src/settings/settings.ts', 'settings.js');
    
    // Copy static files
    console.log('Copying static files...');
    copyFileSync(resolve('src/background-classification.js'), resolve('dist/background-classification.js'));
    copyFileSync(resolve('src/background-image-captioning.js'), resolve('dist/background-image-captioning.js'));
    copyFileSync(resolve('src/popup.html'), resolve('dist/popup.html'));
    copyFileSync(resolve('src/settings/index.html'), resolve('dist/settings/index.html'));

    cpSync(resolve('src/settings'), resolve('dist/settings'), { recursive: true });
    
    console.log('✓ All builds completed successfully!');
  } catch (error) {
    console.error('Build error:', error);
    process.exit(1);
  }
}

buildAll();