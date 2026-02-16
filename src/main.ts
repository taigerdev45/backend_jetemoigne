import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);

    // Global Prefix
    app.setGlobalPrefix('api/v1');

    // Configuration Swagger
    const config = new DocumentBuilder()
      .setTitle('Jetemoigne-TV API')
      .setDescription(
        "Documentation de l'API Backend pour la plateforme Jetemoigne-TV",
      )
      .setVersion('1.2.0')
      .addTag('auth', 'Authentification et profil')
      .addTag('testimonies', 'Gestion des témoignages')
      .addTag('programs', 'Gestion des programmes et direct')
      .addTag('donations', 'Gestion des transactions et dons')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT ?? 3001;
    logger.log(`Starting application on port ${port}...`);

    await app.listen(port, '0.0.0.0');

    logger.log(`Application is live on: http://0.0.0.0:${port}/api/v1`);
    logger.log(
      `Swagger documentation available on: http://0.0.0.0:${port}/api/docs`,
    );
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}
void bootstrap();
