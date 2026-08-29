import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { mapDocument } from '../common/map-document';
import { ListingsService } from '../listings/listings.service';
import { BookingStatus } from './booking-status.enum';
import { Booking, BookingDocument } from './booking.schema';
import { BookingListing } from './booking.type';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private readonly listingsService: ListingsService,
  ) {}

  private parseDate(dateString: string): Date | null {
    const date = new Date(`${dateString}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private mapBookingListing(listing: {
    id: string;
    title: string;
    location: string;
    images: string[];
    pricePerNight: number;
  }): BookingListing {
    return {
      id: listing.id,
      title: listing.title,
      location: listing.location,
      images: listing.images,
      pricePerNight: listing.pricePerNight,
    };
  }

  private mapBooking(
    booking: BookingDocument,
    listing: {
      id: string;
      title: string;
      location: string;
      images: string[];
      pricePerNight: number;
    },
  ) {
    const mapped = mapDocument(booking.toObject());

    return {
      id: mapped.id,
      checkIn: this.formatDate(booking.checkIn),
      checkOut: this.formatDate(booking.checkOut),
      guests: booking.guests,
      totalNights: booking.totalNights,
      pricePerNight: booking.pricePerNight,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt as Date,
      listing: this.mapBookingListing(listing),
    };
  }

  private calculateTotalNights(checkIn: Date, checkOut: Date): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.round(
      (checkOut.getTime() - checkIn.getTime()) / millisecondsPerDay,
    );
  }

  private async hasOverlap(
    listingId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<boolean> {
    const overlappingBooking = await this.bookingModel
      .findOne({
        listingId: new Types.ObjectId(listingId),
        status: BookingStatus.CONFIRMED,
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
      })
      .exec();

    return !!overlappingBooking;
  }

  async createBooking(
    userId: string,
    listingId: string,
    checkInInput: string,
    checkOutInput: string,
    guests: number,
  ) {
    const checkIn = this.parseDate(checkInInput);
    const checkOut = this.parseDate(checkOutInput);

    if (!checkIn || !checkOut) {
      throw new BadRequestException('Invalid booking dates.');
    }

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'Check-out date must be after check-in date.',
      );
    }

    if (guests <= 0) {
      throw new BadRequestException('Number of guests must be greater than 0.');
    }

    const listing = await this.listingsService.findById(listingId);

    if (guests > listing.guests) {
      throw new BadRequestException(
        "Number of guests exceeds this property's capacity.",
      );
    }

    const totalNights = this.calculateTotalNights(checkIn, checkOut);

    if (totalNights <= 0) {
      throw new BadRequestException('Invalid booking dates.');
    }

    const hasConflict = await this.hasOverlap(listingId, checkIn, checkOut);

    if (hasConflict) {
      throw new BadRequestException(
        'This listing is already booked for the selected dates.',
      );
    }

    const totalPrice = totalNights * listing.pricePerNight;

    const booking = await this.bookingModel.create({
      userId: new Types.ObjectId(userId),
      listingId: new Types.ObjectId(listingId),
      checkIn,
      checkOut,
      guests,
      totalNights,
      pricePerNight: listing.pricePerNight,
      totalPrice,
      status: BookingStatus.CONFIRMED,
    });

    return this.mapBooking(booking, listing);
  }

  async findByUser(userId: string) {
    const bookings = await this.bookingModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    const results = await Promise.all(
      bookings.map(async (booking) => {
        const listing = await this.listingsService.findById(
          booking.listingId.toString(),
        );
        return this.mapBooking(booking, listing);
      }),
    );

    return results;
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId).exec();

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You are not allowed to cancel this booking.',
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled.');
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    const listing = await this.listingsService.findById(
      booking.listingId.toString(),
    );

    return this.mapBooking(booking, listing);
  }
}
