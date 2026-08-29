import { registerEnumType } from '@nestjs/graphql';

export enum ListingCategory {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  CABIN = 'CABIN',
  HOTEL = 'HOTEL',
}

registerEnumType(ListingCategory, {
  name: 'ListingCategory',
});
