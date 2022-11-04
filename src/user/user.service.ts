import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto';

type UserRes = {
  success: boolean;
  message: string;

  users?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  }[];
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  count?: number;
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  //get all users
  async getAllUsers(): Promise<UserRes | null> {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      const count = await this.prisma.user.count();
      if (users.length === 0) {
        throw new NotFoundException();
      }
      return { success: true, message: 'All users', users, count };
    } catch (error) {
      throw error;
    }
  }
  //get user by id
  async getUserById(userId: number): Promise<UserRes | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
      if (!user) {
        throw new NotFoundException();
      }
      return { success: true, message: 'User detail', user };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  //update user
  async updateUser(
    userId: number,
    dto: UpdateUserDto,
  ): Promise<UserRes | null> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
      if (!user) {
        throw new NotFoundException();
      }
      return { success: true, message: 'Updated successfully' };
    } catch (error) {
      throw error;
    }
  }
  // delete user
  async deleteUser(userId: number) {
    try {
      const user = await this.prisma.user.delete({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new NotFoundException();
      }
      return { success: true, message: 'User deleted' };
    } catch (error) {
      throw error;
    }
  }
}
