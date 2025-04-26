import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/users.entity';

const mockUsersRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUsersRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser: User = { id: 'test_id', password: 'test_password', internalId: 1 };
      (usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.findById('test_id');

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test_id' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await usersService.findById('nonexistent_id');

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 'nonexistent_id' } });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const mockUserData = { id: 'new_id', password: 'new_password' };
      const mockCreatedUser: User = { id: 'new_id', password: 'new_password', internalId: 1 };

      (usersRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
      (usersRepository.save as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await usersService.create(mockUserData);

      expect(usersRepository.create).toHaveBeenCalledWith(mockUserData);
      expect(usersRepository.save).toHaveBeenCalledWith(mockCreatedUser);
      expect(result).toEqual(mockCreatedUser);
    });
  });
});