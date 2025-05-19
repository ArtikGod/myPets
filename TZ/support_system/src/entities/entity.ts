import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { APPEAL_STATUS } from '../config/constants';

@Entity()
export class Appeal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  topic!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: Object.values(APPEAL_STATUS),
    default: APPEAL_STATUS.NEW
  })
  status!: string;

  @Column({ nullable: true })
  resolutionText!: string;

  @Column({ nullable: true })
  cancellationReason!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}