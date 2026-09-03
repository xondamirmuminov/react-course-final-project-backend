import { Injectable, Scope, UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../auth/optional-gql-auth.guard';
import { Listing } from '../listings/listing.type';
import { User } from '../users/user.type';
import { FavoritesService } from './favorites.service';
import { UserFavoritesLoader } from './user-favorites.loader';

@Injectable({ scope: Scope.REQUEST })
@Resolver(() => Listing)
export class FavoritesResolver {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly userFavoritesLoader: UserFavoritesLoader,
  ) {}

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

  @ResolveField(() => Boolean)
  @UseGuards(OptionalGqlAuthGuard)
  async isFavorite(
    @Parent() listing: Listing,
    @CurrentUser() user?: User | null,
  ) {
    if (!user) {
      return false;
    }

    const favoriteIds = await this.userFavoritesLoader.getFavoriteListingIds(
      user.id,
    );

    return favoriteIds.has(listing.id);
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
