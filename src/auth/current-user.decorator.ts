import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../users/user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User | undefined => {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<{ req?: { user?: User } }>();
    return ctx.req?.user;
  },
);
