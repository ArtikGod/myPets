import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BookingStatus } from '../interfaces/booking-status.enum';
import { Restaurant } from './restaurant.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'restaurant_id' })
  restaurantId: number;

  @Column({ type: 'date', name: 'booking_date' })
  bookingDate: string;

  @Column({ type: 'time', name: 'booking_time' })
  bookingTime: string;

  @Column({ name: 'guest_count' })
  guestCount: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CREATED,
  })
  status: BookingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.bookings)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}