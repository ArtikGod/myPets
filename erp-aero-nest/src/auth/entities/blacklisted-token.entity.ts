import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class BlacklistedToken {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
