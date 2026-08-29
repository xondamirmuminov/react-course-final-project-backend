import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from './booking-status.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Listing', required: true, index: true })
  listingId: Types.ObjectId;

  @Prop({ required: true })
  checkIn: Date;

  @Prop({ required: true })
  checkOut: Date;

  @Prop({ required: true })
  guests: number;

  @Prop({ required: true })
  totalNights: number;

  @Prop({ required: true })
  pricePerNight: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({
    required: true,
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  createdAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ listingId: 1, status: 1, checkIn: 1, checkOut: 1 });
