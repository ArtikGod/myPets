import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../auth/auth.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WEBSOCKET_CONSTANTS } from './constants/websocket.constants';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userEmail?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WebSocketGateway');
  private connectedUsers = new Map<string, number>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  afterInit(server: Server) {
    this.logger.log(WEBSOCKET_CONSTANTS.MESSAGES.GATEWAY_INITIALIZED);
  }

  async handleConnection(client: AuthenticatedSocket, ...args: any[]) {
    this.logger.log(`${WEBSOCKET_CONSTANTS.MESSAGES.CLIENT_CONNECTED}: ${client.id}`);
    
    try {
      const token = this.extractTokenFromHandshake(client);
      if (token) {
        const user = await this.validateToken(token);
        if (user) {
          client.userId = user.id;
          client.userEmail = user.email;
          this.connectedUsers.set(client.id, user.id);
          
          client.join(`user_${user.id}`);
          
          this.logger.log(`${WEBSOCKET_CONSTANTS.MESSAGES.USER_AUTHENTICATED}: ${user.email}`);
          
          client.emit(WEBSOCKET_CONSTANTS.EVENTS.AUTHENTICATED, {
            success: true,
            user: { id: user.id, email: user.email },
          });
          
          client.broadcast.emit(WEBSOCKET_CONSTANTS.EVENTS.USER_ONLINE, { userId: user.id });
        }
      }
    } catch (error) {
      this.logger.warn(`${WEBSOCKET_CONSTANTS.MESSAGES.AUTH_ERROR}: ${error.message}`);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.connectedUsers.get(client.id);
    
    if (userId) {
      client.broadcast.emit(WEBSOCKET_CONSTANTS.EVENTS.USER_OFFLINE, { userId });
      this.connectedUsers.delete(client.id);
    }
    
    this.logger.log(`${WEBSOCKET_CONSTANTS.MESSAGES.CLIENT_DISCONNECTED}: ${client.id}`);
  }

  @SubscribeMessage(WEBSOCKET_CONSTANTS.EVENTS.AUTHENTICATE)
  async handleAuthentication(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { token: string },
  ) {
    try {
      const user = await this.validateToken(data.token);
      
      if (user) {
        client.userId = user.id;
        client.userEmail = user.email;
        this.connectedUsers.set(client.id, user.id);
        
        client.join(`user_${user.id}`);
        
        client.emit(WEBSOCKET_CONSTANTS.EVENTS.AUTHENTICATED, {
          success: true,
          user: { id: user.id, email: user.email },
        });
        
        client.broadcast.emit(WEBSOCKET_CONSTANTS.EVENTS.USER_ONLINE, { userId: user.id });
        
        this.logger.log(`${WEBSOCKET_CONSTANTS.MESSAGES.USER_AUTHENTICATED_VIA_MESSAGE}: ${user.email}`);
      } else {
        client.emit(WEBSOCKET_CONSTANTS.EVENTS.AUTHENTICATION_ERROR, {
          success: false,
          message: WEBSOCKET_CONSTANTS.MESSAGES.INVALID_TOKEN,
        });
      }
    } catch (error) {
      client.emit(WEBSOCKET_CONSTANTS.EVENTS.AUTHENTICATION_ERROR, {
        success: false,
        message: WEBSOCKET_CONSTANTS.MESSAGES.AUTH_ERROR,
      });
    }
  }

  @SubscribeMessage(WEBSOCKET_CONSTANTS.EVENTS.JOIN_ROOM)
  @UseGuards(WsJwtGuard)
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    client.emit(WEBSOCKET_CONSTANTS.EVENTS.JOINED_ROOM, { room: data.room });
    this.logger.log(`${WEBSOCKET_CONSTANTS.MESSAGES.USER_JOINED_ROOM}: ${client.userId} -> ${data.room}`);
  }

  @SubscribeMessage(WEBSOCKET_CONSTANTS.EVENTS.LEAVE_ROOM)
  @UseGuards(WsJwtGuard)
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    client.emit(WEBSOCKET_CONSTANTS.EVENTS.LEFT_ROOM, { room: data.room });
    this.logger.log(`${WEBSOCKET_CONSTANTS.MESSAGES.USER_LEFT_ROOM}: ${client.userId} -> ${data.room}`);
  }

  @SubscribeMessage(WEBSOCKET_CONSTANTS.EVENTS.SEND_MESSAGE)
  @UseGuards(WsJwtGuard)
  handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; message: string },
  ) {
    const messageData = {
      userId: client.userId,
      userEmail: client.userEmail,
      message: data.message,
      timestamp: new Date().toISOString(),
    };

    this.server.to(data.room).emit(WEBSOCKET_CONSTANTS.EVENTS.NEW_MESSAGE, messageData);
    
    this.logger.log(`${WEBSOCKET_CONSTANTS.MESSAGES.MESSAGE_SENT}: ${client.userEmail} -> ${data.room}`);
  }

  notifyFileUploaded(userId: number, fileData: any) {
    this.server.to(`user_${userId}`).emit(WEBSOCKET_CONSTANTS.EVENTS.FILE_UPLOADED, {
      type: WEBSOCKET_CONSTANTS.EVENTS.FILE_UPLOADED,
      data: fileData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyUserStatusChange(userId: number, status: 'online' | 'offline') {
    this.server.emit(`${WEBSOCKET_CONSTANTS.EVENTS.USER_PREFIX}${status}`, { userId, timestamp: new Date().toISOString() });
  }

  sendNotificationToUser(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit(WEBSOCKET_CONSTANTS.EVENTS.NOTIFICATION, {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastNotification(notification: any) {
    this.server.emit(WEBSOCKET_CONSTANTS.EVENTS.BROADCAST_NOTIFICATION, {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const token = client.handshake.auth?.token || 
                 client.handshake.headers?.authorization?.replace(WEBSOCKET_CONSTANTS.AUTH.BEARER_PREFIX, '');
    return token || null;
  }

  private async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get(WEBSOCKET_CONSTANTS.AUTH.JWT_ACCESS_SECRET),
      });
      
      return await this.authService.validateUser(payload);
    } catch (error) {
      return null;
    }
  }

  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      connectedUsers: Array.from(this.connectedUsers.values()),
    };
  }
}