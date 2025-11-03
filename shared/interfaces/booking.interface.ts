import { BookingStatus } from './booking-status.enum';

export interface IBooking {
  id: number;
  restaurantId: number;
  bookingDate: string;
  bookingTime: string;
  guestCount: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRestaurant {
  id: number;
  name: string;
  createdAt: Date;
}

export interface BookingCreatedEvent {
  booking: IBooking;
  timestamp: Date;
}

export interface BookingStatusUpdatedEvent {
  bookingId: number;
  status: BookingStatus;
  timestamp: Date;
}