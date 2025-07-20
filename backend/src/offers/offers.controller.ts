import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from 'src/users/entities/user.entity';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  async createOffer(
    @Req() req: Request & { user: User },
    @Body() createOfferDto: CreateOfferDto,
  ) {
    return await this.offersService.createOffer(req.user.id, createOfferDto);
  }

  @Get()
  async getAllOffers() {
    return await this.offersService.findAllOffers();
  }

  @Get(':id')
  async getOfferById(@Param('id') id: number) {
    return await this.offersService.findOfferById(id);
  }
}
