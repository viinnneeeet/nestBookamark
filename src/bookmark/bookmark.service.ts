import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

type BookmarkType = {
  success: boolean;
  message: string;
  bookmarks?: {
    id: number;
    title: string;
    description: string;
    link: string;
    user?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }[];
  bookmark?: {
    id: number;
    title: string;
    description: string;
    link: string;
    user?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
  count?: number;
};

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getAllBookmark(): Promise<BookmarkType | null> {
    try {
      const bookmarks = await this.prisma.bookmark.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          link: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
            },
          },
        },
      });
      const count = await this.prisma.bookmark.count();
      if (bookmarks.length != 0) {
        return { success: true, message: 'All Bookmarks', bookmarks, count };
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      throw error;
    }
  }

  async getBookmarkById(bookmarkId: number): Promise<BookmarkType | null> {
    try {
      const bookmark = await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          link: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
            },
          },
        },
      });
      if (!bookmark) {
        throw new NotFoundException();
      }

      return { success: true, message: 'Bookmark detail', bookmark };
    } catch (error) {
      throw error;
    }
  }

  async getUserBookmark(userId: number): Promise<BookmarkType | null> {
    try {
      console.log({ userId });

      const bookmarks = await this.prisma.bookmark.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          link: true,
        },
      });
      const count = await this.prisma.bookmark.count({
        where: {
          userId,
        },
      });
      if (bookmarks.length != 0) {
        return {
          success: true,
          message: 'User bookmarks list',
          bookmarks,
          count,
        };
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      throw error;
    }
  }

  async createBookmark(
    dto: CreateBookmarkDto,
    userId: number,
  ): Promise<BookmarkType | null> {
    try {
      const bookmark = await this.prisma.bookmark.create({
        data: {
          title: dto.title,
          description: dto.description,
          link: dto.link,
          userId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          link: true,
        },
      });
      return {
        success: true,
        message: 'Bookmark created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateBookmark(
    userId: number,
    bookmarkId: number,
    dto: UpdateBookmarkDto,
  ) {
    try {
      const bookmark = await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });
      if (!bookmark || bookmark.userId != userId) {
        throw new ForbiddenException('Access to this resource is denied');
      }
      await this.prisma.bookmark.update({
        where: {
          id: bookmarkId,
        },
        data: {
          ...dto,
        },
      });
      return { success: true, message: 'Updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async deleteBookmarkById(
    bookmarkId: number,
    userId: number,
  ): Promise<BookmarkType | null> {
    try {
      const bookmark = await this.prisma.bookmark.delete({
        where: {
          id: bookmarkId,
        },
      });
      if (!bookmark) {
        throw new BadRequestException();
      }
      if (bookmark.userId != userId) {
        throw new MethodNotAllowedException('Access denied');
      }
      return { success: true, message: 'Deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
