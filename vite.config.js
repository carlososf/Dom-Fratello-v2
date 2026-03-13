import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Faz o Vite ignorar o processamento de imagens e apenas movê-las se necessário
  // mas o ideal é deixar ele processar para versionamento
  publicDir: 'public' // Vou criar essa pasta e colocar as imagens lá para garantir 100% de sucesso
});
