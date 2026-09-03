import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ListingsService } from '../listings/listings.service';
import { Favorite, FavoriteDocument } from './favorite.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
    private readonly listingsService: ListingsService,
  ) {}

  async add(userId: string, listingId: string) {
    const listingExists = await this.listingsService.exists(listingId);

    if (!listingExists) {
      throw new NotFoundException('Listing not found.');
    }

    const userObjectId = new Types.ObjectId(userId);
    const listingObjectId = new Types.ObjectId(listingId);

    const existingFavorite = await this.favoriteModel
      .findOne({ userId: userObjectId, listingId: listingObjectId })
      .exec();

    if (existingFavorite) {
      throw new ConflictException('Listing is already in favorites.');
    }

    await this.favoriteModel.create({
      userId: userObjectId,
      listingId: listingObjectId,
    });

    return this.listingsService.findById(listingId);
  }

  async remove(userId: string, listingId: string) {
    const favorite = await this.favoriteModel
      .findOneAndDelete({
        userId: new Types.ObjectId(userId),
        listingId: new Types.ObjectId(listingId),
      })
      .exec();

    if (!favorite) {
      throw new NotFoundException('Favorite not found.');
    }

    return this.listingsService.findById(listingId);
  }

  async findByUser(userId: string) {
    const favorites = await this.favoriteModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    if (favorites.length === 0) {
      return [];
    }

    const listingIds = favorites.map((favorite) =>
      favorite.listingId.toString(),
    );

    return this.listingsService.findByIds(listingIds);
  }

  async findListingIdsByUser(userId: string) {
    const favorites = await this.favoriteModel
      .find({ userId: new Types.ObjectId(userId) })
      .select('listingId')
      .exec();

    return favorites.map((favorite) => favorite.listingId.toString());
  }

  async isFavorite(userId: string, listingId: string) {
    const favorite = await this.favoriteModel
      .findOne({
        userId: new Types.ObjectId(userId),
        listingId: new Types.ObjectId(listingId),
      })
      .exec();

    return !!favorite;
  }
}
