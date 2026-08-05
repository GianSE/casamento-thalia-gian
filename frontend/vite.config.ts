import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Encaminha chamadas de API para o Worker (wrangler dev) em desenvolvimento
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        /**
         * Divisão por caminho do módulo (e não por nome de pacote).
         *
         * Com a lista `['react', 'react-dom', ...]` o Rollup deixava
         * `react/jsx-runtime` de fora do chunk do React e o encaixava no do
         * framer-motion. Como todo componente importa o runtime de JSX, o
         * resultado era o site público baixar 38 kB (gzip) da biblioteca de
         * animação que só o /admin usa.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          const path = id.replace(/\\/g, '/');

          if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(path)) {
            return 'motion-vendor';
          }
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(path)) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
