import { defineConfig } from 'vite';

export default defineConfig({
  // Vite vai procurar o index.html na raiz por padrão
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Garante que o build entenda caminhos relativos se necessário
    base: './'
  }
});
