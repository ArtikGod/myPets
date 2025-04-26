import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column({ unique: true })
  id: string; 

  @Column()
  password: string;
}
