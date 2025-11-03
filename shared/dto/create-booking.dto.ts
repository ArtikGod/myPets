import { IsNotEmpty, IsNumber, IsString, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID ресторана',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  restaurantId: number;

  @ApiProperty({
    description: 'Дата бронирования в формате YYYY-MM-DD',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  bookingDate: string;

  @ApiProperty({
    description: 'Время бронирования в формате HH:MM',
    example: '19:30',
  })
  @IsNotEmpty()
  @IsString()
  bookingTime: string;

  @ApiProperty({
    description: 'Количество гостей',
    example: 4,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  guestCount: number;
}