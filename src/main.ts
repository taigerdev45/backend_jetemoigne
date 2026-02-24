import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);

    // CORS — autoriser le frontend Vercel et le dev local
    const allowedOrigins = (
      process.env.ALLOWED_ORIGINS ||
      'https://frontend-jetemoigne.vercel.app,http://localhost:3000'
    ).split(',').map((o) => o.trim());

    app.enableCors({
      origin: (origin, callback) => {
        // Autoriser les requêtes sans origin (ex: curl, Swagger, server-side Next.js)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin non autorisé: ${origin}`), false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

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
