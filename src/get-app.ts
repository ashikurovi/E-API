import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as compression from 'compression';

let appPromise: Promise<NestExpressApplication> | null = null;

export async function getApp(): Promise<NestExpressApplication> {
  if (!appPromise) {
    appPromise = (async () => {
      const app = await NestFactory.create<NestExpressApplication>(AppModule);
      app.use(compression());
      app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://e-landing-dusky.vercel.app',
        'https://e-console-87n5.vercel.app',

      ];

      app.enableCors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          if (/^https:\/\/[a-z0-9-]+\.console\.squadcart\.app$/i.test(origin)) {
            return callback(null, true);
          }
          if (/^https?:\/\/[a-z0-9-]+\.localhost(:\d+)?$/i.test(origin)) {
            return callback(null, true);
          }
          return callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Content-Disposition'],
      });

      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

      const config = new DocumentBuilder()
        .setTitle('E-Commerce API')
        .setDescription('E-Commerce API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);

      await app.init();
      return app;
    })();
  }
  return appPromise;
}
