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
import { FILES_CONSTANTS } from '../constants/files.constants';

@Table({
  tableName: FILES_CONSTANTS.ENTITY.TABLE_NAME,
  timestamps: true,
})
export class File extends Model<File> {
  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.ID })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.ORIGINAL_NAME })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  originalName: string;

  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.FILENAME })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  filename: string;

  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.PATH })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  path: string;

  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.MIMETYPE })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  mimetype: string;

  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.SIZE })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  size: number;

  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.USER_ID })
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.CREATED_AT })
  @CreatedAt
  createdAt: Date;

  @ApiProperty({ description: FILES_CONSTANTS.ENTITY.DESCRIPTIONS.UPDATED_AT })
  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;
}