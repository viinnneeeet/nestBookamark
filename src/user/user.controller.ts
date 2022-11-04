import {
  Body,
  Param,
  Controller,
  Get,
  HttpCode,
  Patch,
  UseGuards,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @HttpCode(200)
  @Get('me')
  getMe(
    @GetUser() user: User,
    // @GetUser('email') email: string
  ) {
    return user;
  }
  @HttpCode(200)
  @Get('')
  getAll() {
    return this.userService.getAllUsers();
  }

  @HttpCode(200)
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.getUserById(userId);
  }

  @HttpCode(200)
  @Patch('')
  updateUser(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(userId, dto);
  }

  @HttpCode(200)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.deleteUser(userId);
  }
}
