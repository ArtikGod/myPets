import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../../common/interfaces/auth.interface';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User) private userModel: typeof User,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(AUTH_CONSTANTS.JWT.ACCESS_SECRET_ENV),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userModel.findByPk(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException(AUTH_CONSTANTS.MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }
}