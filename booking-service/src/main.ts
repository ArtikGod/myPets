import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('BookingService');
  
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'booking-service',
        brokers: [configService.get<string>('KAFKA_BROKER')],
      },
      consumer: {
        groupId: 'booking-service-consumer',
      },
    },
  });

  await app.listen();
  logger.log('Booking Service запущен и слушает Kafka события');
  logger.log(`Kafka broker: ${configService.get<string>('KAFKA_BROKER')}`);
  logger.log('Ожидаем сообщения на топике: booking.created');
}

bootstrap().catch((error) => {
  console.error('Ошибка запуска Booking Service:', error);
  process.exit(1);
});