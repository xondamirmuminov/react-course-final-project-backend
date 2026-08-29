import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ListingCategory } from '../listing-category.enum';

@InputType()
export class CreateListingInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  description: string;

  @Field(() => ListingCategory)
  @IsEnum(ListingCategory)
  category: ListingCategory;

  @Field()
  @IsNotEmpty()
  location: string;

  @Field()
  @IsNotEmpty()
  address: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1)
  pricePerNight: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  guests: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  beds: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  bathrooms: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  reviewsCount?: number;

  @Field(() => [String])
  @IsArray()
  images: string[];

  @Field(() => [String])
  @IsArray()
  amenities: string[];

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
