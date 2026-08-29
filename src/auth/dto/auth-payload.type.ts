import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/user.type';

@ObjectType()
export class AuthPayload {
  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;
}
