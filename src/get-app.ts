import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; // আপনার src ফোল্ডারের পাথ চেক করুন
import { NestExpressApplication } from '@nestjs/platform-express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as compression from 'compression';

let cachedApp: NestExpressApplication;

async function bootstrap(): Promise<NestExpressApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn'],
    });

    // CORS Setup
    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.use(compression());
    
    // নোট: Vercel-এ WebSockets কাজ করে না, তাই IoAdapter বাদ দেওয়া হয়েছে।
    
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance();
  
  // Express instance handle করবে রিকোয়েস্ট
  return instance(req, res);
}