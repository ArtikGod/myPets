import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_CONSTANTS } from './common/constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: APP_CONSTANTS.VALIDATION.WHITELIST,
      forbidNonWhitelisted: APP_CONSTANTS.VALIDATION.FORBID_NON_WHITELISTED,
      transform: APP_CONSTANTS.VALIDATION.TRANSFORM,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(APP_CONSTANTS.SWAGGER.TITLE)
    .setDescription(APP_CONSTANTS.SWAGGER.DESCRIPTION)
    .setVersion(APP_CONSTANTS.SWAGGER.VERSION)
    .addTag(APP_CONSTANTS.SWAGGER.TAG)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(APP_CONSTANTS.SWAGGER.PATH, app, document);

  if (APP_CONSTANTS.CORS.ENABLED) {
    app.enableCors();
  }

  const port = process.env.PORT || APP_CONSTANTS.DEFAULT_PORT;
  await app.listen(port);

  console.log(`${APP_CONSTANTS.MESSAGES.APP_STARTED} ${port}`);
  console.log(
    `${APP_CONSTANTS.MESSAGES.SWAGGER_AVAILABLE}${port}/${APP_CONSTANTS.SWAGGER.PATH}`,
  );
}

bootstrap();
