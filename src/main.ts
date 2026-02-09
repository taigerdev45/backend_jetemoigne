import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Jetemoigne-TV API')
    .setDescription(
      "Documentation de l'API Backend pour la plateforme Jetemoigne-TV",
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentification et profil')
    .addTag('testimonies', 'Gestion des témoignages')
    .addTag('programs', 'Gestion des programmes et direct')
    .addTag('donations', 'Gestion des transactions et dons')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation available on: http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
