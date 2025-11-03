import 'reflect-metadata';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../interfaces/booking-status.enum';

export class BookingResponseDto {
  @ApiProperty({
    description: 'ID бронирования',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'ID ресторана',
    example: 1,
  })
  restaurantId!: number;

  @ApiProperty({
    description: 'Дата бронирования',
    example: '2024-01-15',
  })
  bookingDate!: string;

  @ApiProperty({
    description: 'Время бронирования',
    example: '19:30',
  })
  bookingTime!: string;

  @ApiProperty({
    description: 'Количество гостей',
    example: 4,
  })
  guestCount!: number;

  @ApiProperty({
    description: 'Статус бронирования',
    enum: BookingStatus,
    example: BookingStatus.CREATED,
  })
  status!: BookingStatus;

  @ApiProperty({
    description: 'Дата создания',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Дата обновления',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt!: Date;
}