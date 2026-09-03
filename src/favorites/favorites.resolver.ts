import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { Listing } from '../listings/listing.type';
import { User } from '../users/user.type';
import { FavoritesService } from './favorites.service';

@Resolver()
export class FavoritesResolver {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Query(() => [Listing])
  @UseGuards(GqlAuthGuard)
  favorites(@CurrentUser() user: User) {
    return this.favoritesService.findByUser(user.id);
  }

  @Query(() => Boolean, { name: 'isFavorite' })
  @UseGuards(GqlAuthGuard)
  isFavoriteQuery(
    @CurrentUser() user: User,
    @Args('listingId', { type: () => ID }) listingId: string,
  ) {
    return this.favoritesService.isFavorite(user.id, listingId);
  }

  @Mutation(() => Listing)
  @UseGuards(GqlAuthGuard)
  addFavorite(
    @CurrentUser() user: User,
    @Args('listingId', { type: () => ID }) listingId: string,
  ) {
    return this.favoritesService.add(user.id, listingId);
  }

  @Mutation(() => Listing)
  @UseGuards(GqlAuthGuard)
  removeFavorite(
    @CurrentUser() user: User,
    @Args('listingId', { type: () => ID }) listingId: string,
  ) {
    return this.favoritesService.remove(user.id, listingId);
  }
}
