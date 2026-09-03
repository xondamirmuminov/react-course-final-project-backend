import { Module, Scope } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';
import { Favorite, FavoriteSchema } from './favorite.schema';
import { FavoritesResolver } from './favorites.resolver';
import { FavoritesService } from './favorites.service';
import { UserFavoritesLoader } from './user-favorites.loader';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    ListingsModule,
    AuthModule,
  ],
  providers: [
    FavoritesService,
    UserFavoritesLoader,
    {
      provide: FavoritesResolver,
      useClass: FavoritesResolver,
      scope: Scope.REQUEST,
    },
  ],
})
export class FavoritesModule {}
