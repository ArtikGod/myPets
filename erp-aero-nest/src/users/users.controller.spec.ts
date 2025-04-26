import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

const mockJwtAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    return true; 
  },
};

describe('UsersController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
    .overrideGuard(JwtAuthGuard) 
    .useValue(mockJwtAuthGuard)
    .compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('getUserInfo', () => {
    it('should return the user ID from the request', () => {
      const mockReq = {
        user: { id: 'test_user_id' },
      } as any; 

      const result = usersController.getUserInfo(mockReq);

      expect(result).toEqual({ id: 'test_user_id' });
    });
  });
});