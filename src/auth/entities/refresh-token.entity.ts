import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'refresh_tokens',
  timestamps: true,
})
export class RefreshToken extends Model<RefreshToken> {
  @ApiProperty({ description: 'ID токена' })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({ description: 'Refresh токен' })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  token: string;

  @ApiProperty({ description: 'ID пользователя' })
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ApiProperty({ description: 'Дата истечения токена' })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt: Date;

  @ApiProperty({ description: 'Дата создания' })
  @CreatedAt
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}