import { defineConfig } from 'vite';

export default defineConfig({
  // caminhos relativos: o build (pasta dist/) funciona em qualquer servidor
  base: './',
  server: { open: true },
});
