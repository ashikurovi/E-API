import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

let cachedApp: NestExpressApplication;

export async function getApp() {
  if (!cachedApp) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

app.enableCors({
  origin: ['http://localhost:5173', 'https://e-landing-dusky.vercel.app', 'https://e-console-87n5.vercel.app', ],
  credentials: false, // optional: cookie/credential নেই
});



    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}
