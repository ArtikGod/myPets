import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WEBSOCKET_CONSTANTS } from '../constants/websocket.constants';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException(WEBSOCKET_CONSTANTS.AUTH.TOKEN_NOT_PROVIDED);
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get(WEBSOCKET_CONSTANTS.AUTH.JWT_ACCESS_SECRET),
      });

      client.data.user = payload;
      
      return true;
    } catch (error) {
      throw new WsException(WEBSOCKET_CONSTANTS.ERRORS.TOKEN_INVALID);
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith(WEBSOCKET_CONSTANTS.AUTH.BEARER_PREFIX)) {
      return authHeader.substring(WEBSOCKET_CONSTANTS.AUTH.BEARER_PREFIX_LENGTH);
    }

    const authToken = client.handshake.auth?.token;
    if (authToken) {
      return authToken;
    }

    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }
}