import { registerEnumType } from '@nestjs/graphql';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(BookingStatus, {
  name: 'BookingStatus',
});
