import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource, Repository } from 'typeorm';
import { BalanceService } from './balance.service';
import { User } from '../users/entities/user.entity';
import {
  PaymentHistory,
  PaymentAction,
} from '../payment-history/entities/payment-history.entity';

describe('BalanceService', () => {
  let service: BalanceService;
  let userRepository: Repository<User>;
  let paymentHistoryRepository: Repository<PaymentHistory>;
  let dataSource: DataSource;
  let cacheManager: any;

  const mockUser = {
    id: 1,
    balance: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPaymentHistoryRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(PaymentHistory),
          useValue: mockPaymentHistoryRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    paymentHistoryRepository = module.get<Repository<PaymentHistory>>(
      getRepositoryToken(PaymentHistory),
    );
    dataSource = module.get<DataSource>(DataSource);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserBalance', () => {
    it('должен возвращать баланс пользователя из кеша', async () => {
      const cachedBalance = 500;
      mockCacheManager.get.mockResolvedValue(cachedBalance);

      const result = await service.getUserBalance(1);

      expect(result).toEqual({ userId: 1, balance: cachedBalance });
      expect(mockCacheManager.get).toHaveBeenCalledWith('user_balance_1');
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });

    it('должен возвращать баланс пользователя из базы данных если нет в кеше', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserBalance(1);

      expect(result).toEqual({ userId: 1, balance: 1000 });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'user_balance_1',
        1000,
        300,
      );
    });

    it('должен выбрасывать NotFoundException если пользователь не найден', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserBalance(999)).rejects.toThrow(
        'Пользователь с ID 999 не найден',
      );
    });
  });

  describe('createUser', () => {
    it('должен создавать пользователя с начальным балансом', async () => {
      const initialBalance = 1000;
      const createdUser = { ...mockUser, balance: initialBalance };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockPaymentHistoryRepository.create.mockReturnValue({
        id: 1,
        userId: 1,
        action: PaymentAction.CREDIT,
        amount: initialBalance,
        description: 'Начальный баланс',
        ts: new Date(),
      });

      const result = await service.createUser(initialBalance);

      expect(result).toEqual(createdUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        balance: initialBalance,
      });
      expect(mockPaymentHistoryRepository.create).toHaveBeenCalledWith({
        userId: 1,
        action: PaymentAction.CREDIT,
        amount: initialBalance,
        description: 'Начальный баланс',
      });
    });
  });
});
