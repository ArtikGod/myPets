import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '../users/entities/user.entity';
import {
  PaymentHistory,
  PaymentAction,
} from '../payment-history/entities/payment-history.entity';
import { DebitBalanceDto } from './dto/debit-balance.dto';
import { APP_CONSTANTS } from '../common/constants/app.constants';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PaymentHistory)
    private paymentHistoryRepository: Repository<PaymentHistory>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async debitBalance(debitBalanceDto: DebitBalanceDto) {
    const { userId, amount, description } = debitBalanceDto;

    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { [APP_CONSTANTS.DATABASE.FIELDS.ID]: userId },
        lock: { mode: APP_CONSTANTS.DATABASE.LOCK_MODE },
      });

      if (!user) {
        throw new NotFoundException(
          APP_CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND(userId),
        );
      }

      if (user.balance < amount) {
        throw new BadRequestException(
          APP_CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_FUNDS(user.balance, amount),
        );
      }

      const paymentHistory = manager.create(PaymentHistory, {
        userId,
        action: PaymentAction.DEBIT,
        amount,
        description:
          description || APP_CONSTANTS.OPERATION_DESCRIPTIONS.DEBIT_DEFAULT,
      });

      await manager.save(PaymentHistory, paymentHistory);

      const newBalance = await this.recalculateBalanceFromHistory(
        userId,
        manager,
      );

      user.balance = newBalance;
      await manager.save(User, user);

      await this.cacheManager.del(
        APP_CONSTANTS.CACHE_KEYS.USER_BALANCE(userId),
      );

      return {
        success: APP_CONSTANTS.DEFAULTS.SUCCESS_TRUE,
        userId,
        previousBalance: user.balance + amount,
        newBalance: user.balance,
        debitedAmount: amount,
        transactionId: paymentHistory.id,
        timestamp: paymentHistory.ts,
      };
    });
  }

  async getUserBalance(
    userId: number,
  ): Promise<{ userId: number; balance: number }> {
    const cacheKey = APP_CONSTANTS.CACHE_KEYS.USER_BALANCE(userId);

    const cachedBalance = await this.cacheManager.get<number>(cacheKey);
    if (cachedBalance !== undefined) {
      return { userId, balance: cachedBalance };
    }

    const user = await this.userRepository.findOne({
      where: { [APP_CONSTANTS.DATABASE.FIELDS.ID]: userId },
    });

    if (!user) {
      throw new NotFoundException(
        APP_CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND(userId),
      );
    }

    await this.cacheManager.set(
      cacheKey,
      user.balance,
      APP_CONSTANTS.CACHE_TTL,
    );

    return { userId, balance: user.balance };
  }

  async getPaymentHistory(
    userId: number,
    limit: number = APP_CONSTANTS.DEFAULT_HISTORY_LIMIT,
  ): Promise<PaymentHistory[]> {
    const user = await this.userRepository.findOne({
      where: { [APP_CONSTANTS.DATABASE.FIELDS.ID]: userId },
    });

    if (!user) {
      throw new NotFoundException(
        APP_CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND(userId),
      );
    }

    const safeLimit = Math.min(limit, APP_CONSTANTS.MAX_HISTORY_LIMIT);

    return await this.paymentHistoryRepository.find({
      where: { userId },
      order: {
        [APP_CONSTANTS.DATABASE.FIELDS.TIMESTAMP]:
          APP_CONSTANTS.DATABASE.ORDER_DESC,
      },
      take: safeLimit,
    });
  }

  private async recalculateBalanceFromHistory(
    userId: number,
    manager?: Repository<PaymentHistory>[typeof APP_CONSTANTS.DATABASE.MANAGER],
  ): Promise<number> {
    const repository = manager
      ? manager.getRepository(PaymentHistory)
      : this.paymentHistoryRepository;

    const history = await repository.find({
      where: { userId },
      order: {
        [APP_CONSTANTS.DATABASE.FIELDS.TIMESTAMP]:
          APP_CONSTANTS.DATABASE.ORDER_ASC,
      },
    });

    let balance = APP_CONSTANTS.DEFAULTS.BALANCE_ZERO;
    for (const transaction of history) {
      if (transaction.action === PaymentAction.CREDIT) {
        balance += Number(transaction.amount);
      } else if (transaction.action === PaymentAction.DEBIT) {
        balance -= Number(transaction.amount);
      }
    }

    return balance;
  }

  async createUser(
    initialBalance: number = APP_CONSTANTS.DEFAULTS.INITIAL_BALANCE,
  ): Promise<User> {
    const user = this.userRepository.create({
      [APP_CONSTANTS.DATABASE.FIELDS.BALANCE]: initialBalance,
    });
    const savedUser = await this.userRepository.save(user);

    if (initialBalance > APP_CONSTANTS.DEFAULTS.BALANCE_ZERO) {
      const paymentHistory = this.paymentHistoryRepository.create({
        userId: savedUser.id,
        action: PaymentAction.CREDIT,
        amount: initialBalance,
        description: APP_CONSTANTS.OPERATION_DESCRIPTIONS.INITIAL_BALANCE,
      });
      await this.paymentHistoryRepository.save(paymentHistory);
    }

    return savedUser;
  }
}
