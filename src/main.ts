import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

function resolveCorsOrigins(corsOrigin?: string): string[] {
  const defaults = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
  ];

  if (!corsOrigin?.trim()) {
    return defaults;
  }

  return [
    ...defaults,
    ...corsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: resolveCorsOrigins(configService.get<string>('CORS_ORIGIN')),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.getHttpAdapter().getInstance().get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);

  console.log(`GraphQL API running at http://localhost:${port}/graphql`);
}

void bootstrap();
