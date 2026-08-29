import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UsersService } from '../users/users.service';
import { AuthPayload } from './dto/auth-payload.type';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async validateInput<T extends object>(cls: new () => T, input: T) {
    const dto = plainToInstance(cls, input);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new BadRequestException(
        errors
          .flatMap((error) => Object.values(error.constraints ?? {}))
          .join(', '),
      );
    }

    return dto;
  }

  async register(input: RegisterInput): Promise<AuthPayload> {
    const validatedInput = await this.validateInput(RegisterInput, input);
    const user = await this.usersService.create(
      validatedInput.name,
      validatedInput.email,
      validatedInput.password,
    );

    return {
      user,
      accessToken: this.signToken(user.id),
    };
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const validatedInput = await this.validateInput(LoginInput, input);

    const user = await this.usersService.findByEmail(validatedInput.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      validatedInput.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const safeUser = await this.usersService.findById(user._id.toString());

    return {
      user: safeUser,
      accessToken: this.signToken(safeUser.id),
    };
  }

  private signToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      },
    );
  }
}
