import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ListingCategory } from './listing-category.enum';

export type ListingDocument = HydratedDocument<Listing>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Listing {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ListingCategory })
  category: ListingCategory;

  @Prop({ required: true, trim: true, index: true })
  location: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, index: true })
  pricePerNight: number;

  @Prop({ required: true })
  guests: number;

  @Prop({ required: true })
  bedrooms: number;

  @Prop({ required: true })
  beds: number;

  @Prop({ required: true })
  bathrooms: number;

  @Prop({ required: true, default: 0 })
  rating: number;

  @Prop({ required: true, default: 0 })
  reviewsCount: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ default: false, index: true })
  isFeatured: boolean;

  createdAt?: Date;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);

ListingSchema.index({ category: 1 });
ListingSchema.index({ title: 'text', description: 'text', location: 'text' });
