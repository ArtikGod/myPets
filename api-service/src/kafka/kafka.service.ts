import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { BookingCreatedEvent } from '../../../shared/interfaces/booking.interface';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.log('Kafka client connected');
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.log('Kafka client disconnected');
  }

  async publishBookingCreated(event: BookingCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Publishing booking created event for booking ID: ${event.booking.id}`);
      
      await this.kafkaClient.emit('booking.created', {
        value: JSON.stringify(event),
      });

      this.logger.log(`Successfully published booking created event for booking ID: ${event.booking.id}`);
    } catch (error) {
      this.logger.error(`Failed to publish booking created event: ${error.message}`, error.stack);
      throw error;
    }
  }
}