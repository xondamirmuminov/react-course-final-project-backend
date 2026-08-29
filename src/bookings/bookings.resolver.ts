import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { User } from '../users/user.type';
import { Booking } from './booking.type';
import { BookingsService } from './bookings.service';

@Resolver(() => Booking)
export class BookingsResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @Query(() => [Booking])
  @UseGuards(GqlAuthGuard)
  bookings(@CurrentUser() user: User) {
    return this.bookingsService.findByUser(user.id);
  }

  @Mutation(() => Booking)
  @UseGuards(GqlAuthGuard)
  createBooking(
    @CurrentUser() user: User,
    @Args('listingId', { type: () => ID }) listingId: string,
    @Args('checkIn') checkIn: string,
    @Args('checkOut') checkOut: string,
    @Args('guests', { type: () => Int }) guests: number,
  ) {
    return this.bookingsService.createBooking(
      user.id,
      listingId,
      checkIn,
      checkOut,
      guests,
    );
  }

  @Mutation(() => Booking)
  @UseGuards(GqlAuthGuard)
  cancelBooking(
    @CurrentUser() user: User,
    @Args('bookingId', { type: () => ID }) bookingId: string,
  ) {
    return this.bookingsService.cancelBooking(user.id, bookingId);
  }
}
