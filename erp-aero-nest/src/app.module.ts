import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/users.entity';
import { BlacklistedToken } from './auth/entities/blacklisted-token.entity';
import { FileModule } from './file/file.module';
import { FileEntity } from './file/entities/file.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT', '3306')),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD') || '',
        database: config.get('DB_DATABASE'),
        entities: [User, BlacklistedToken, FileEntity],
        synchronize: true, 
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    FileModule,
  ],
})
export class AppModule {}
