import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminGuard } from '../auth/admin.guard';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../auth/optional-gql-auth.guard';
import { CreateListingInput } from './dto/create-listing.input';
import { ListingCategory } from './listing-category.enum';
import { Listing } from './listing.type';
import { ListingsResponse } from './listings-response.type';
import { ListingsService } from './listings.service';

@Resolver(() => Listing)
export class ListingsResolver {
  constructor(private readonly listingsService: ListingsService) {}

  @Query(() => ListingsResponse)
  @UseGuards(OptionalGqlAuthGuard)
  listings(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 12 })
    limit: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('category', { type: () => ListingCategory, nullable: true })
    category?: ListingCategory,
    @Args('location', { type: () => String, nullable: true }) location?: string,
    @Args('minPrice', { type: () => Int, nullable: true }) minPrice?: number,
    @Args('maxPrice', { type: () => Int, nullable: true }) maxPrice?: number,
  ) {
    return this.listingsService.findAll({
      page,
      limit,
      search,
      category,
      location,
      minPrice,
      maxPrice,
    });
  }

  @Query(() => [Listing])
  @UseGuards(OptionalGqlAuthGuard)
  featuredListings(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 6 })
    limit: number,
  ) {
    return this.listingsService.findFeatured(limit);
  }

  @Query(() => Listing)
  @UseGuards(OptionalGqlAuthGuard)
  listing(@Args('id', { type: () => ID }) id: string) {
    return this.listingsService.findById(id);
  }

  @Mutation(() => Listing)
  @UseGuards(GqlAuthGuard, AdminGuard)
  createListing(@Args('input') input: CreateListingInput) {
    return this.listingsService.create(input);
  }
}
