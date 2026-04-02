#!/usr/bin/env node
/**
 * Exposes localhost:TUNNEL_PORT (default 3001) via a free HTTPS URL so a
 * Firebase-hosted build can call your local RetailFlow API.
 *
 * Usage:
 *   Terminal 1: npm run backend:dev
 *   Terminal 2: npm run tunnel
 *   Then copy VITE_API_BASE_URL into frontend/.env.production, or:
 *   npm run tunnel:write   (writes frontend/.env.production and keeps tunnel open)
 *
 * After URL is set: npm run build && firebase deploy --only hosting
 */
import fs from 'fs';
import path from 'path';
import localtunnel from 'localtunnel';

const port = parseInt(process.env.TUNNEL_PORT || '3001', 10);
const writeEnv = process.argv.includes('--write');

const tunnel = await localtunnel({ port });
const apiBase = `${tunnel.url.replace(/\/$/, '')}/api`;

console.log('');
console.log('  ── RetailFlow public API base (for frontend/.env.production) ──');
console.log(`  VITE_API_BASE_URL=${apiBase}`);
console.log('');
console.log('  Keep this process running. Press Ctrl+C to stop the tunnel.');
console.log(`  Tunnel:  ${tunnel.url}  →  http://127.0.0.1:${port}`);
console.log('');

if (writeEnv) {
  const dest = path.join(process.cwd(), 'frontend', '.env.production');
  fs.writeFileSync(dest, `VITE_API_BASE_URL=${apiBase}\n`, 'utf8');
  console.log(`  Wrote ${dest}`);
  console.log('  Next: npm run build && firebase deploy --only hosting');
  console.log('');
}

tunnel.on('close', () => process.exit(0));

process.on('SIGINT', () => {
  tunnel.close();
  process.exit(0);
});
