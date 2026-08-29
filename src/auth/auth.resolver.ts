import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DemoUser, User } from '../users/user.type';
import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth-payload.type';
import { CurrentUser } from './current-user.decorator';
import { GqlAuthGuard } from './gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  register(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.authService.register({ name, email, password });
  }

  @Mutation(() => AuthPayload)
  login(@Args('email') email: string, @Args('password') password: string) {
    return this.authService.login({ email, password });
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }

  @Query(() => DemoUser)
  demoUser() {
    return { email: 'demo@example.com' };
  }
}
