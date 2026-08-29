import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../users/user.type';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);
    const req = gqlContext.getContext<{ req: { user?: User } }>().req;
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Authentication required.');
    }

    const adminEmail = this.configService
      .getOrThrow<string>('ADMIN_EMAIL')
      .toLowerCase();

    if (user.email.toLowerCase() !== adminEmail) {
      throw new ForbiddenException('Admin access required.');
    }

    return true;
  }
}
