import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Serves the demo, importing the library from source the way a consumer would import the package.
export default defineConfig({
  root: 'demo',
  resolve: { alias: { 'astro-wheel': fileURLToPath(new URL('./src/index.ts', import.meta.url)) } },
  server: { port: 5180 },
});
