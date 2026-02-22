import type { VercelRequest, VercelResponse } from '@vercel/node';
import { join } from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Load Nest app from nest build output (dist/src). Use process.cwd() so path works on Vercel (project root).
  const distPath = join(process.cwd(), 'dist', 'src');
  const { getApp } = require(join(distPath, 'get-app.js'));
  const app = await getApp();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}