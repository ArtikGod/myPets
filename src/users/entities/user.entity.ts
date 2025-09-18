import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

@Entity(APP_CONSTANTS.DATABASE.TABLES.USERS)
export class User {
  @ApiProperty({
    description: APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.USER_ID,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description:
      APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.USER_BALANCE,
    example: APP_CONSTANTS.API_DESCRIPTIONS.EXAMPLES.BALANCE_EXAMPLE,
  })
  @Column(APP_CONSTANTS.DATABASE.COLUMN_TYPES.DECIMAL, {
    precision: APP_CONSTANTS.DECIMAL_PRECISION,
    scale: APP_CONSTANTS.DECIMAL_SCALE,
    default: APP_CONSTANTS.DEFAULTS.BALANCE_ZERO,
  })
  balance: number;

  @ApiProperty({
    description: APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.CREATED_AT,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.UPDATED_AT,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    APP_CONSTANTS.DATABASE.RELATIONS.PAYMENT_HISTORY_ENTITY,
    APP_CONSTANTS.DATABASE.RELATIONS.USER_RELATION,
  )
  paymentHistory: any[];
}
