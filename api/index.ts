import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';

// Run as soon as this file loads so require('src/...') is patched before any Nest code runs.
(function () {
  const Module = require('module');
  const distSrc = path.join(__dirname, '..', 'dist', 'src');
  const orig = Module._resolveFilename;
  (Module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean) {
    if (typeof request === 'string' && request.startsWith('src/')) {
      const sub = request.slice(4);
      const distFile = path.join(distSrc, sub) + '.js';
      try {
        return orig.call(this, distFile, parent, isMain);
      } catch {
        return orig.call(this, path.join(distSrc, sub), parent, isMain);
      }
    }
    return orig.call(this, request, parent, isMain);
  };
})();

let getAppFn: (() => Promise<import('@nestjs/platform-express').NestExpressApplication>) | null = null;
function getApp() {
  if (!getAppFn) {
    const distPath = path.join(__dirname, '..', 'dist', 'src', 'get-app');
    getAppFn = require(distPath).getApp;
  }
  return getAppFn();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const app = await getApp();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}