import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { buildPagination } from '../common/pagination.helper';
import { mapDocument } from '../common/map-document';
import { CreateListingInput } from './dto/create-listing.input';
import { ListingCategory } from './listing-category.enum';
import { Listing, ListingDocument } from './listing.schema';

export interface FindAllListingsArgs {
  page?: number;
  limit?: number;
  search?: string;
  category?: ListingCategory;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class ListingsService {
  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
  ) {}

  private mapListing(doc: ListingDocument | Record<string, unknown>) {
    const plain =
      typeof (doc as ListingDocument).toObject === 'function'
        ? (doc as ListingDocument).toObject()
        : doc;
    return mapDocument(plain as ListingDocument);
  }

  async findAll(args: FindAllListingsArgs) {
    const page = args.page && args.page > 0 ? args.page : 1;
    const limit = Math.min(args.limit && args.limit > 0 ? args.limit : 12, 50);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (args.category) {
      filter.category = args.category;
    }

    if (args.location) {
      filter.location = { $regex: args.location, $options: 'i' };
    }

    if (args.minPrice !== undefined || args.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (args.minPrice !== undefined) {
        priceFilter.$gte = args.minPrice;
      }
      if (args.maxPrice !== undefined) {
        priceFilter.$lte = args.maxPrice;
      }
      filter.pricePerNight = priceFilter;
    }

    if (args.search) {
      filter.$or = [
        { title: { $regex: args.search, $options: 'i' } },
        { description: { $regex: args.search, $options: 'i' } },
        { location: { $regex: args.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.listingModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.listingModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((item) => this.mapListing(item)),
      pagination: buildPagination(page, limit, total),
    };
  }

  async findFeatured(limit = 6) {
    const safeLimit = Math.min(limit > 0 ? limit : 6, 50);
    const items = await this.listingModel
      .find({ isFeatured: true })
      .sort({ rating: -1 })
      .limit(safeLimit)
      .exec();

    return items.map((item) => this.mapListing(item));
  }

  async findById(id: string) {
    const listing = await this.listingModel.findById(id).exec();

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    return this.mapListing(listing);
  }

  async create(input: CreateListingInput) {
    const listing = await this.listingModel.create({
      ...input,
      rating: input.rating ?? 0,
      reviewsCount: input.reviewsCount ?? 0,
      isFeatured: input.isFeatured ?? false,
    });

    return this.mapListing(listing);
  }

  async findByIds(ids: string[]) {
    const listings = await this.listingModel.find({ _id: { $in: ids } }).exec();
    return listings.map((item) => this.mapListing(item));
  }

  async exists(id: string) {
    const count = await this.listingModel.countDocuments({ _id: id }).exec();
    return count > 0;
  }
}
