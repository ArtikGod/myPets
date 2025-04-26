import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true), 
}));

const mockUsersService = () => ({
  findById: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('should throw UnauthorizedException if user already exists', async () => {
      const mockSignUpDto: SignUpDto = { id: 'existing_user', password: 'password' };
      (usersService.findById as jest.Mock).mockResolvedValue({ id: 'existing_user' });

      await expect(authService.signup(mockSignUpDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should hash the password, create a user, and return tokens', async () => {
      const mockSignUpDto: SignUpDto = { id: 'new_user', password: 'password' };
      (usersService.findById as jest.Mock).mockResolvedValue(undefined);
      (usersService.create as jest.Mock).mockResolvedValue({ id: 'new_user' });
      (jwtService.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.signup(mockSignUpDto);

      expect(usersService.findById).toHaveBeenCalledWith(mockSignUpDto.id);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockSignUpDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({ id: mockSignUpDto.id, password: 'hashed_password' });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ accessToken: 'mock_token', refreshToken: 'mock_token' });
    });
  });

  describe('signin', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      const mockSignInDto: SignInDto = { id: 'nonexistent_user', password: 'password' };
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.signin(mockSignInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockSignInDto: SignInDto = { id: 'existing_user', password: 'wrong_password' };
      (usersService.findById as jest.Mock).mockResolvedValue({ id: 'existing_user', password: 'hashed_password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); 
      await expect(authService.signin(mockSignInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if credentials are valid', async () => {
      const mockSignInDto: SignInDto = { id: 'existing_user', password: 'password' };
      (usersService.findById as jest.Mock).mockResolvedValue({ id: 'existing_user', password: 'hashed_password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); 
      (jwtService.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.signin(mockSignInDto);

      expect(usersService.findById).toHaveBeenCalledWith(mockSignInDto.id);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockSignInDto.password, 'hashed_password');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ accessToken: 'mock_token', refreshToken: 'mock_token' });
    });
  });

  describe('refreshAccessToken', () => {
    it('should throw UnauthorizedException if refreshToken is invalid', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshAccessToken('invalid_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if refreshToken is valid', async () => {
      const mockPayload = { sub: 'user_id' };
      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
      (jwtService.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.refreshAccessToken('valid_token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid_token', { secret: process.env.JWT_REFRESH_SECRET });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ accessToken: 'mock_token', refreshToken: 'mock_token' });
    });
  });
});