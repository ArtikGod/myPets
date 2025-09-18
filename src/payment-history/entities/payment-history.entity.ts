import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

export enum PaymentAction {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

@Entity(APP_CONSTANTS.DATABASE.TABLES.PAYMENT_HISTORY)
export class PaymentHistory {
  @ApiProperty({
    description: APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.PAYMENT_ID,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description:
      APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.PAYMENT_USER_ID,
  })
  @Column()
  userId: number;

  @ApiProperty({
    description:
      APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.PAYMENT_ACTION,
    enum: PaymentAction,
  })
  @Column({
    type: APP_CONSTANTS.DATABASE.COLUMN_TYPES.ENUM,
    enum: PaymentAction,
  })
  action: PaymentAction;

  @ApiProperty({
    description:
      APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.PAYMENT_AMOUNT,
    example: APP_CONSTANTS.API_DESCRIPTIONS.EXAMPLES.PAYMENT_AMOUNT,
  })
  @Column(APP_CONSTANTS.DATABASE.COLUMN_TYPES.DECIMAL, {
    precision: APP_CONSTANTS.DECIMAL_PRECISION,
    scale: APP_CONSTANTS.DECIMAL_SCALE,
  })
  amount: number;

  @ApiProperty({
    description:
      APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.PAYMENT_TIMESTAMP,
  })
  @CreateDateColumn()
  ts: Date;

  @ApiProperty({
    description:
      APP_CONSTANTS.API_DESCRIPTIONS.ENTITY_DESCRIPTIONS.PAYMENT_DESCRIPTION,
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(
    APP_CONSTANTS.DATABASE.RELATIONS.USER_ENTITY,
    APP_CONSTANTS.DATABASE.RELATIONS.PAYMENT_HISTORY_RELATION,
  )
  @JoinColumn({ name: APP_CONSTANTS.DATABASE.FIELDS.USER_ID })
  user: any;
}
