import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';

// Load Nest app from compiled dist at runtime so require() paths resolve correctly.
// Dynamic require prevents the bundler from pulling in src/ (which has wrong paths on Vercel).
const getApp = (() => {
  const distPath = path.join(__dirname, '..', 'dist', 'src', 'get-app');
  return require(distPath).getApp as () => Promise<import('@nestjs/platform-express').NestExpressApplication>;
})();

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

  const app = await getApp();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}