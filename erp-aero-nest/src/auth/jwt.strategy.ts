import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ERROR_MESSAGES, JWT_ACCESS_SECRET_KEY } from 'src/shared/constants';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>(JWT_ACCESS_SECRET_KEY),
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return { id: user.id }; 
  }
}
