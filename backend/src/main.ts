import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Moodly API')
    .setDescription('API de suivi anonyme du moral des équipes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = app.get(ConfigService).get<number>('PORT', 3000);
  // Listen on all interfaces so the phone can reach the API on the local network
  await app.listen(port, '0.0.0.0');
}
await bootstrap();
