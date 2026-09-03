import { Injectable, Scope, UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { OptionalGqlAuthGuard } from '../auth/optional-gql-auth.guard';
import { Listing } from '../listings/listing.type';
import { User } from '../users/user.type';
import { UserFavoritesLoader } from './user-favorites.loader';

@Injectable({ scope: Scope.REQUEST })
@Resolver(() => Listing)
export class ListingFavoriteResolver {
  constructor(private readonly userFavoritesLoader: UserFavoritesLoader) {}

  @ResolveField(() => Boolean)
  @UseGuards(OptionalGqlAuthGuard)
  async isFavorite(
    @Parent() listing: Listing,
    @CurrentUser() user?: User | null,
  ) {
    if (!user?.id) {
      return false;
    }

    const favoriteIds = await this.userFavoritesLoader.getFavoriteListingIds(
      user.id,
    );

    return favoriteIds.has(listing.id);
  }
}
