import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';
import { Booking, BookingSchema } from './booking.schema';
import { BookingsResolver } from './bookings.resolver';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ListingsModule,
    AuthModule,
  ],
  providers: [BookingsService, BookingsResolver],
})
export class BookingsModule {}
