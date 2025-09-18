import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentHistory } from './entities/payment-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentHistory])],
  exports: [TypeOrmModule],
})
export class PaymentHistoryModule {}
