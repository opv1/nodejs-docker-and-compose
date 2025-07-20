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
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistsService } from './wishlists.service';
import { User } from 'src/users/entities/user.entity';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Wish } from 'src/wishes/entities/wish.entity';

@UseGuards(JwtGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  @Post()
  async createWishlist(
    @Req() req: Request & { user: User },
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    return await this.wishlistsService.createWishlist(
      req.user.id,
      createWishlistDto,
    );
  }

  @Get()
  getAllWishlists() {
    return this.wishlistsService.findAllWishlists();
  }

  @Get(':id')
  async getWishlistById(@Param('id') id: number) {
    return await this.wishlistsService.findWishlistById(id);
  }

  @Patch(':id')
  async updateWishlist(
    @Req() req: Request & { user: User },
    @Param('id') id: number,
    @Body()
    updateWishlistDto: Omit<UpdateWishlistDto, 'items'> & { items?: Wish[] },
  ) {
    return await this.wishlistsService.updateWishlist(
      id,
      req.user.id,
      updateWishlistDto,
    );
  }

  @Delete(':id')
  async removeWishlist(
    @Req() req: Request & { user: User },
    @Param('id') id: number,
  ) {
    return await this.wishlistsService.removeWishlist(id, req.user.id);
  }
}
