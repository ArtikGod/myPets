import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { MESSAGE, JWT_CONFIG, USER_SELECT_FIELDS } from '../config/constants.auth.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerDto.password, MESSAGE.PASSWORD_SALT_ROUNDS);
    const user = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
    });
    return this.usersRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: USER_SELECT_FIELDS
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException(MESSAGE.INVALID_CREDENTIALS);
    }

    const payload = { sub: user.id, email: user.email, name: user.name };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get(JWT_CONFIG.EXPIRES_IN),
      }), 
    };
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException(MESSAGE.USER_NOT_FOUND);
    }
    return user;
  }
}