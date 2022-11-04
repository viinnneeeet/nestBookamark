import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config/dist';

type AuthRes = {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signIn(dto: AuthDto): Promise<AuthRes | null> {
    try {
      // find the user by Email
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
        select: {
          email: true,
          id: true,
          hash: true,
          firstName: true,
          lastName: true,
        },
      });
      // if user not exist throw exception
      if (!user) {
        throw new ForbiddenException('Credentials incorrect');
      }
      // compare password
      const pwdMatch = await argon.verify(user.hash, dto.password);
      // if password incorrect throw exception
      if (!pwdMatch) {
        throw new ForbiddenException('Credentials incorrect');
      }
      // send back user
      delete user.hash;
      const accessToken = await this.signToken(user.id, user.email);
      return { message: 'Login Successful', success: true, user, accessToken };
    } catch (error) {
      throw error;
    }
  }

  async signUp(dto: AuthDto): Promise<AuthRes | null> {
    try {
      // genrate the password hash
      const hash = await argon.hash(dto.password);
      // save the new user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      // return the saved user
      const accessToken = await this.signToken(user.id, user.email);

      return { success: true, user, accessToken, message: 'User Created' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signToken(userId: number, email: string): Promise<string | null> {
    const payload = {
      sub: userId,
      email,
    };
    return this.jwt.signAsync(payload, {
      expiresIn: '20m',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
