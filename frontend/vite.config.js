import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  if (mode === 'production') {
    const u = (env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
    const lowered = u.toLowerCase();
    if (!u) {
      throw new Error(
        'Production build needs VITE_API_BASE_URL in frontend/.env.production.\n' +
          '1) Terminal A: npm run backend:dev\n' +
          '2) Terminal B: npm run tunnel:write   (writes .env.production with your tunnel /api URL)\n' +
          '3) npm run build\n' +
          'Do not use an empty URL — Firebase Hosting is only static files and has no /api.'
      );
    }
    if (lowered.includes('onrender.com')) {
      throw new Error(
        'Remove Render from VITE_API_BASE_URL in frontend/.env.production.\n' +
          'Suspending Render does not change an old deployed build — this file was still pointing at onrender.com.\n' +
          'Run: npm run tunnel:write (backend on port 3001), then npm run build && firebase deploy --only hosting.'
      );
    }
    if (!u.startsWith('https://')) {
      throw new Error(
        `Production VITE_API_BASE_URL must use https:// (your tunnel or public API). Current value: ${u}`
      );
    }
  }

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
