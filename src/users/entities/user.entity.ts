import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { File } from '../../files/entities/file.entity';
import { AUTH_CONSTANTS } from '../../auth/constants/auth.constants';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { USERS_CONSTANTS } from '../constants/users.constants';

@Table({
  tableName: USERS_CONSTANTS.ENTITY.TABLE_NAME,
  timestamps: true,
})
export class User extends Model<User> {
  @ApiProperty({ description: USERS_CONSTANTS.ENTITY.ID_DESCRIPTION })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({ description: USERS_CONSTANTS.ENTITY.EMAIL_DESCRIPTION })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @ApiProperty({ description: USERS_CONSTANTS.ENTITY.FIRST_NAME_DESCRIPTION })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName: string;

  @ApiProperty({ description: USERS_CONSTANTS.ENTITY.LAST_NAME_DESCRIPTION })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName: string;

  @ApiProperty({ description: USERS_CONSTANTS.ENTITY.CREATED_AT_DESCRIPTION })
  @CreatedAt
  createdAt: Date;

  @ApiProperty({ description: USERS_CONSTANTS.ENTITY.UPDATED_AT_DESCRIPTION })
  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => File)
  files: File[];

  @HasMany(() => RefreshToken)
  refreshTokens: RefreshToken[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(AUTH_CONSTANTS.BCRYPT.SALT_ROUNDS);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}