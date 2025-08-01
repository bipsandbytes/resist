import { build } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';
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
  copyFileSync(resolve(__dirname, tempDir, outputName), resolve(__dirname, 'dist', outputName));
  
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
    
    // Copy static files
    console.log('Copying static files...');
    copyFileSync(resolve('src/background-classification.js'), resolve('dist/background-classification.js'));
    copyFileSync(resolve('src/background-image-captioning.js'), resolve('dist/background-image-captioning.js'));
    copyFileSync(resolve('src/popup.html'), resolve('dist/popup.html'));
    copyFileSync(resolve('src/settings.html'), resolve('dist/settings.html'));
    
    console.log('✓ All builds completed successfully!');
  } catch (error) {
    console.error('Build error:', error);
    process.exit(1);
  }
}

buildAll();