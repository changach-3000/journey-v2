import { defineConfig } from 'vite';

export default defineConfig({
  envDir: '..',
  publicDir: '../public',
  server: { port: 5174 },
  build: { outDir: 'dist', emptyOutDir: true },
});