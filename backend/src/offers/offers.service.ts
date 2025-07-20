import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { Wish } from 'src/wishes/entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async createOffer(userId: number, createOfferDto: CreateOfferDto) {
    const { itemId, amount } = createOfferDto;

    const wish = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: { owner: true },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id === userId) {
      throw new BadRequestException(
        'Нельзя вносить деньги на собственные подарки',
      );
    }

    const newRaised = Number(wish.raised) + Number(amount);

    if (newRaised > wish.price) {
      throw new BadRequestException(
        'Сумма собранных средств не может превышать стоимость подарка',
      );
    }

    await this.wishRepository.update(wish.id, { raised: newRaised });

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { wishes: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const offer = this.offerRepository.create({
      ...createOfferDto,
      user: user,
      item: wish,
    });

    const createdOffer = await this.offerRepository.save(offer);

    const newOffer = await this.offerRepository.findOneBy({
      id: createdOffer.id,
    });

    return newOffer;
  }

  async findAllOffers() {
    return await this.offerRepository.find({
      relations: { user: true, item: true },
    });
  }

  async findOfferById(offerId: number) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: { user: true, item: true },
    });

    if (!offer) {
      throw new NotFoundException('Желающий не найден');
    }

    return offer;
  }
}
