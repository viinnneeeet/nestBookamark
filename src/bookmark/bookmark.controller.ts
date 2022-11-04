import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private bookmark: BookmarkService) {}

  @Get('')
  getAllBookmark() {
    return this.bookmark.getAllBookmark();
  }

  @Get(':id')
  getBookmarkById(@Param('id', ParseIntPipe) bookmarkId: number) {
    return this.bookmark.getBookmarkById(bookmarkId);
  }

  @Post('')
  createBookmark(
    @GetUser('id') userId: number,
    @Body()
    dto: CreateBookmarkDto,
  ) {
    return this.bookmark.createBookmark(dto, userId);
  }

  @Delete(':id')
  deleteBookmark(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmark.deleteBookmarkById(bookmarkId, userId);
  }

  @Patch(':id')
  updateBookmark(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: UpdateBookmarkDto,
  ) {
    return this.bookmark.updateBookmark(userId, bookmarkId, dto);
  }
}
