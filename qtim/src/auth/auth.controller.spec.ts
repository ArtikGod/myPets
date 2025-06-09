import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService: Partial<jest.Mocked<AuthService>> = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
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

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return it', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'secure-password',
        name: 'Test User',
      };

      const mockUser: User = {
        id: 1,
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name,
      } as User;

      authService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);
      expect(result).toEqual(mockUser);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should log in the user and return an access token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'secure-password',
      };

      const tokenResponse = { accessToken: 'test-token' };
      authService.login.mockResolvedValue(tokenResponse);

      const result = await controller.login(loginDto);
      expect(result).toEqual(tokenResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
