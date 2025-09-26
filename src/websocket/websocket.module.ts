import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { WebsocketGateway } from './websocket.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    AuthModule,
  ],
  providers: [WebsocketGateway, WsJwtGuard],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}