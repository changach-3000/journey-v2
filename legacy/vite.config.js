// Lets you run the old scroll-map site from inside /legacy:  npm run legacy
import { defineConfig } from 'vite';

export default defineConfig({
  root: new URL('.', import.meta.url).pathname,
  envDir: '..', // reuse your .env.local (MapTiler key)
  publicDir: '../public', // reuse public/photos
  server: { port: 5174 },
});
