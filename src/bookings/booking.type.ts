import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { BookingStatus } from './booking-status.enum';

@ObjectType()
export class BookingListing {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  location: string;

  @Field(() => [String])
  images: string[];

  @Field(() => Float)
  pricePerNight: number;
}

@ObjectType()
export class Booking {
  @Field(() => ID)
  id: string;

  @Field()
  checkIn: string;

  @Field()
  checkOut: string;

  @Field(() => Int)
  guests: number;

  @Field(() => Int)
  totalNights: number;

  @Field(() => Float)
  pricePerNight: number;

  @Field(() => Float)
  totalPrice: number;

  @Field(() => BookingStatus)
  status: BookingStatus;

  @Field()
  createdAt: Date;

  @Field(() => BookingListing)
  listing: BookingListing;
}
