import type { VercelRequest, VercelResponse } from '@vercel/node';
import { join } from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 🔥 FORCE CORS HEADERS (this is the fix)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Load Nest app from Nest-built dist (avoids "Cannot find module src/common/..." on Vercel)
  const distPath = join(__dirname, '..', 'dist');
  const { getApp } = require(join(distPath, 'get-app.js'));
  const app = await getApp();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}