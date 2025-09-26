import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationOptions, PaginatedResult } from '../common/interfaces/auth.interface';
import { USERS_CONSTANTS } from './constants/users.constants';
import { FILES_CONSTANTS } from '../files/constants/files.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<User>> {
    const { page = USERS_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = USERS_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.userModel.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: ['files'],
    });

    if (!user) {
      throw new NotFoundException(USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUserId: number): Promise<User> {
    if (id !== currentUserId) {
      throw new ForbiddenException(USERS_CONSTANTS.MESSAGES.INSUFFICIENT_PERMISSIONS);
    }

    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND);
    }

    await user.update(updateUserDto);
    
    return this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    if (id !== currentUserId) {
      throw new ForbiddenException(USERS_CONSTANTS.MESSAGES.INSUFFICIENT_PERMISSIONS);
    }

    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND);
    }

    await user.destroy();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
    });
  }

  async getUserStats(userId: number): Promise<object> {
    const user = await this.userModel.findByPk(userId, {
      include: ['files'],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new NotFoundException(USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND);
    }

    const totalFiles = user.files?.length || 0;
    const totalFileSize = user.files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      stats: {
        totalFiles,
        totalFileSize,
        totalFileSizeMB: Math.round(totalFileSize / FILES_CONSTANTS.SIZE.BYTES_IN_MB * 100) / 100,
      },
    };
  }
}