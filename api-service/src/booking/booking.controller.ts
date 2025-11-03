import { Controller, Get, Post, Body, Param, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from '../../../shared/dto/create-booking.dto';
import { BookingResponseDto } from '../../../shared/dto/booking-response.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Создать новое бронирование',
    description: 'Создает новое бронирование столика в ресторане. Бронирование создается со статусом CREATED и отправляется событие в Kafka для проверки доступности.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Бронирование успешно создано',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Внутренняя ошибка сервера',
  })
  async createBooking(@Body() createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Получить информацию о бронировании',
    description: 'Возвращает полную информацию о бронировании по его ID, включая текущий статус.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID бронирования',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Информация о бронировании',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Бронирование не найдено',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректный ID бронирования',
  })
  async getBooking(@Param('id', ParseIntPipe) id: number): Promise<BookingResponseDto> {
    return this.bookingService.getBookingById(id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Получить список всех бронирований',
    description: 'Возвращает список всех бронирований в системе.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список бронирований',
    type: [BookingResponseDto],
  })
  async getAllBookings(): Promise<BookingResponseDto[]> {
    return this.bookingService.getAllBookings();
  }
}