import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('wishes')
export class WishesController {
  constructor(private wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  async createWish(
    @Req() req: Request & { user: User },
    @Body() createWishDto: CreateWishDto,
  ) {
    return await this.wishesService.createWish(req.user.id, createWishDto);
  }

  @Get('top')
  async getTopWish() {
    return await this.wishesService.findTopWishes();
  }

  @Get('last')
  async getLastWish() {
    return await this.wishesService.findLastWishes();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getWishById(@Param('id') id: number) {
    return await this.wishesService.findWishById(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateWish(
    @Req() req: Request & { user: User },
    @Param('id') wishId: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return await this.wishesService.updateWish(
      req.user.id,
      wishId,
      updateWishDto,
    );
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copyWish(
    @Req() req: Request & { user: User },
    @Param('id') wishId: number,
  ) {
    return await this.wishesService.copyWish(req.user.id, wishId);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async removeWish(
    @Req() req: Request & { user: User },
    @Param('id') wishId: number,
  ) {
    return await this.wishesService.removeWish(req.user.id, wishId);
  }
}
