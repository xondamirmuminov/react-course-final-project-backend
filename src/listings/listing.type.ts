import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { ListingCategory } from './listing-category.enum';

@ObjectType()
export class Listing {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => ListingCategory)
  category: ListingCategory;

  @Field()
  location: string;

  @Field()
  address: string;

  @Field(() => Float)
  pricePerNight: number;

  @Field(() => Int)
  guests: number;

  @Field(() => Int)
  bedrooms: number;

  @Field(() => Int)
  beds: number;

  @Field(() => Int)
  bathrooms: number;

  @Field(() => Float)
  rating: number;

  @Field(() => Int)
  reviewsCount: number;

  @Field(() => [String])
  images: string[];

  @Field(() => [String])
  amenities: string[];

  @Field()
  isFeatured: boolean;

  @Field()
  isFavorite: boolean;

  @Field()
  createdAt: Date;
}
