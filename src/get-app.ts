import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';

let cachedApp: NestExpressApplication;

export async function getApp(): Promise<NestExpressApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn'],
    });

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.use(compression());
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}