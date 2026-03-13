import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',
  publicDir: 'public', // Tudo dentro de public/ será movido para o root da dist/
  build: {
    outDir: 'dist',
    assetsDir: 'build-assets', // Pasta para JS/CSS processados, evita conflito com images
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
