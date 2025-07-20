import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from './entities/user.entity';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getUser(@Req() req: Request & { user: User }) {
    return await this.usersService.findUserById(req.user.id);
  }

  @Get('me/wishes')
  async getUserWishes(@Req() req: Request & { user: User }) {
    return await this.usersService.findUserWishes(req.user.id);
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string) {
    return await this.usersService.findUserByUsername(username);
  }

  @Get(':username/wishes')
  async getWishesUser(@Param('username') username: string) {
    const { id } = await this.usersService.findUserByUsername(username);
    return await this.usersService.findUserWishes(id);
  }

  @Patch('me')
  async updateUser(
    @Req() req: Request & { user: User },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @Post('find')
  async getUsersByQuery(@Body() findUserDto: FindUsersDto) {
    return await this.usersService.findUsersByQuery(findUserDto.query);
  }
}
