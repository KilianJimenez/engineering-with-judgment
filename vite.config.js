import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: { es: 'index.html', en: 'en/index.html' },
    },
  },
});
