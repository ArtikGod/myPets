import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1h'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = {
        id: 1,
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        articles: [],
      };

      jest.spyOn(userRepository, 'create').mockReturnValue(user as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.register(registerDto);
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user = {
        id: 1,
        email: loginDto.email,
        password: hashedPassword,
        name: 'Test User',
        articles: [],

      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const result = await service.login(loginDto);
      expect(result).toEqual({ accessToken: 'test-token' });

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: user.id, email: user.email, name: user.name },
        { expiresIn: '1h' }
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrowError(
        'Invalid credentials',
      );
    });
  });
});