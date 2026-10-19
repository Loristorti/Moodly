import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Global app configuration, shared by main.ts and the e2e tests
 * so that tests run against the exact same setup as the real server.
 */
export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
