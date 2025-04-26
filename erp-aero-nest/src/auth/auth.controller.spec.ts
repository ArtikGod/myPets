import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from './blacklist.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

const mockAuthService = () => ({
  signup: jest.fn(),
  signin: jest.fn(),
  refreshAccessToken: jest.fn(),
});

const mockJwtService = () => ({
  decode: jest.fn(),
});

const mockBlacklistService = () => ({
  blacklist: jest.fn(),
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let blacklistService: BlacklistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useFactory: mockAuthService },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: BlacklistService, useFactory: mockBlacklistService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    blacklistService = module.get<BlacklistService>(BlacklistService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup with the provided dto', async () => {
      const mockSignUpDto: SignUpDto = { id: 'test@example.com', password: 'password123' };
      (authService.signup as jest.Mock).mockResolvedValue({  });

      await authController.signup(mockSignUpDto);

      expect(authService.signup).toHaveBeenCalledWith(mockSignUpDto);
    });

    it('should return the result of authService.signup', async () => {
      const mockSignUpDto: SignUpDto = { id: 'test@example.com', password: 'password123' };
      const mockSignupResult = { message: 'Signup successful' };
      (authService.signup as jest.Mock).mockResolvedValue(mockSignupResult);

      const result = await authController.signup(mockSignUpDto);

      expect(result).toEqual(mockSignupResult);
    });
  });

  describe('signin', () => {
    it('should call authService.signin with the provided dto', async () => {
      const mockSignInDto: SignInDto = { id: 'test@example.com', password: 'password123' };
      (authService.signin as jest.Mock).mockResolvedValue({  });

      await authController.signin(mockSignInDto);

      expect(authService.signin).toHaveBeenCalledWith(mockSignInDto);
    });

    it('should return the result of authService.signin', async () => {
      const mockSignInDto: SignInDto = { id: 'test@example.com', password: 'password123' };
      const mockSigninResult = { accessToken: 'some_token' };
      (authService.signin as jest.Mock).mockResolvedValue(mockSigninResult);

      const result = await authController.signin(mockSignInDto);

      expect(result).toEqual(mockSigninResult);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshAccessToken with the provided refresh token', async () => {
      const mockRefreshToken = 'some_refresh_token';
      (authService.refreshAccessToken as jest.Mock).mockResolvedValue({  });

      await authController.refresh(mockRefreshToken);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(mockRefreshToken);
    });

    it('should return the result of authService.refreshAccessToken', async () => {
      const mockRefreshToken = 'some_refresh_token';
      const mockRefreshResult = { accessToken: 'new_access_token' };
      (authService.refreshAccessToken as jest.Mock).mockResolvedValue(mockRefreshResult);

      const result = await authController.refresh(mockRefreshToken);

      expect(result).toEqual(mockRefreshResult);
    });
  });

  describe('logout', () => {
    it('should extract the token from the authorization header', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer some_token',
        },
      } as any as Request;

      (jwtService.decode as jest.Mock).mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }); 

      await authController.logout(mockReq);

      expect(jwtService.decode).toHaveBeenCalledWith('some_token');
    });

    it('should call blacklistService.blacklist with the token and expiresIn', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer some_token',
        },
      } as any as Request;

      const mockDecodedToken = { exp: Math.floor(Date.now() / 1000) + 3600 }; 
      (jwtService.decode as jest.Mock).mockReturnValue(mockDecodedToken);
      (blacklistService.blacklist as jest.Mock).mockResolvedValue(undefined);

      await authController.logout(mockReq);

      const expectedExpiresIn = mockDecodedToken.exp - Math.floor(Date.now() / 1000);
      expect(blacklistService.blacklist).toHaveBeenCalledWith('some_token', expectedExpiresIn);
    });

    it('should return a success message', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer any_token',
        },
      } as any as Request;

      (jwtService.decode as jest.Mock).mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
      (blacklistService.blacklist as jest.Mock).mockResolvedValue(undefined);

      const result = await authController.logout(mockReq);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});