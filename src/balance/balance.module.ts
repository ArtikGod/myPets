import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { User } from '../users/entities/user.entity';
import { PaymentHistory } from '../payment-history/entities/payment-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PaymentHistory])],
  controllers: [BalanceController],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
