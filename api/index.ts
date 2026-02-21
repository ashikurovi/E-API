import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';

// On Vercel, code may still require('src/...'). Patch Node so that resolves to dist/src/...
(function patchSrcRequire() {
  if (typeof process === 'undefined' || !process.env.VERCEL) return;
  const Module = require('module');
  const path = require('path');
  const projectRoot = path.join(__dirname, '..');
  const distSrc = path.join(projectRoot, 'dist', 'src');
  const orig = Module._resolveFilename;
  Module._resolveFilename = function (request: string, parent: any, isMain: boolean) {
    if (typeof request === 'string' && request.startsWith('src/')) {
      const sub = request.slice(4);
      const candidate = path.join(distSrc, sub);
      try {
        return orig.call(this, candidate, parent, isMain);
      } catch {
        return orig.call(this, request, parent, isMain);
      }
    }
    return orig.call(this, request, parent, isMain);
  };
})();

// Load app from dist (built by buildCommand). Patch above makes any require('src/...') resolve to dist.
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