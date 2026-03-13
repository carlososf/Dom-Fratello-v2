import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',
  publicDir: 'public', // Tudo dentro de public/ será copiado para a raiz de dist/
  build: {
    outDir: 'dist',
    assetsDir: 'assets-processed', // Rename to avoid conflict with public/assets
    // Se index.html estiver na raiz, o Vite o processará.
    // Como movemos src/ para public/, o Vite não encontrará os links no root.
    // Ele deixará os links como estão no HTML.
    // Como public/src/ será copiado para dist/src/, tudo funcionará!
  }
});
