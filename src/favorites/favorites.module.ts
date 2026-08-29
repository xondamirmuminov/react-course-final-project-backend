import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';
import { Favorite, FavoriteSchema } from './favorite.schema';
import { FavoritesResolver } from './favorites.resolver';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    ListingsModule,
    AuthModule,
  ],
  providers: [FavoritesService, FavoritesResolver],
})
export class FavoritesModule {}
