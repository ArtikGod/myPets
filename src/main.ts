import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_CONSTANTS } from './common/constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: configService.get('CORS_ORIGIN')?.split(',') || [APP_CONSTANTS.SERVER.DEFAULT_CORS_ORIGIN],
    methods: APP_CONSTANTS.CORS.ALLOWED_METHODS,
    allowedHeaders: APP_CONSTANTS.CORS.ALLOWED_HEADERS,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle(APP_CONSTANTS.SWAGGER.TITLE)
    .setDescription(APP_CONSTANTS.SWAGGER.DESCRIPTION)
    .setVersion(APP_CONSTANTS.SWAGGER.VERSION)
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(APP_CONSTANTS.SWAGGER.PATH, app, document);

  const port = configService.get('PORT') || APP_CONSTANTS.SERVER.DEFAULT_PORT;
  await app.listen(port);
  
  console.log(`🚀 ${APP_CONSTANTS.MESSAGES.SERVER_STARTED} ${port}`);
  console.log(`📚 ${APP_CONSTANTS.MESSAGES.SWAGGER_DOCS}: http://localhost:${port}${APP_CONSTANTS.SWAGGER.PATH}`);
}

bootstrap();