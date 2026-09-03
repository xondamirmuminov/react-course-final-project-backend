import { Injectable, Scope } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Injectable({ scope: Scope.REQUEST })
export class UserFavoritesLoader {
  private cache = new Map<string, Promise<Set<string>>>();

  constructor(private readonly favoritesService: FavoritesService) {}

  getFavoriteListingIds(userId: string): Promise<Set<string>> {
    let promise = this.cache.get(userId);

    if (!promise) {
      promise = this.favoritesService
        .findListingIdsByUser(userId)
        .then((ids) => new Set(ids));
      this.cache.set(userId, promise);
    }

    return promise;
  }
}
