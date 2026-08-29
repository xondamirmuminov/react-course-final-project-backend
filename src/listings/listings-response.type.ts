import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationInfo } from '../common/pagination.type';
import { Listing } from './listing.type';

@ObjectType()
export class ListingsResponse {
  @Field(() => [Listing])
  items: Listing[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
