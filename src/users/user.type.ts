import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class DemoUser {
  @Field()
  email: string;
}
