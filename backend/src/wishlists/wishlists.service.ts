import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { In, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  private readonly logger = new Logger(WishlistsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async createWishlist(userId: number, createWishlistDto: CreateWishlistDto) {
    const { itemsId } = createWishlistDto;

    const wishes = await this.wishRepository.find({
      where: { id: In(itemsId) },
    });

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });

    const createdWishlist = await this.wishlistRepository.save(wishlist);

    const newWishlist = await this.wishlistRepository.findOneBy({
      id: createdWishlist.id,
    });

    return newWishlist;
  }

  async findAllWishlists() {
    return await this.wishlistRepository.find({
      relations: { owner: true, items: true },
    });
  }

  async findWishlistById(wishlistId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: { owner: true, items: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }

    return wishlist;
  }

  async updateWishlist(
    wishlistId: number,
    userId: number,
    updateWishlistDto: Omit<UpdateWishlistDto, 'items'> & { items?: Wish[] },
  ) {
    const wishlistToBeUpdated = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: { owner: true },
    });

    if (!wishlistToBeUpdated) {
      throw new NotFoundException('Список желаний не найден');
    }

    if (wishlistToBeUpdated.owner.id !== userId) {
      throw new BadRequestException(
        'Список желаний может редактировать только владелец',
      );
    }

    if (updateWishlistDto.items) {
      const wishes = await this.wishRepository.find({
        where: { id: In(updateWishlistDto.items) },
      });

      updateWishlistDto.items = wishes;
    }

    await this.wishlistRepository.update(wishlistId, updateWishlistDto);

    const updatedWishlist = await this.wishlistRepository.findOneBy({
      id: wishlistId,
    });

    return updatedWishlist;
  }

  async removeWishlist(wishlistId: number, userId: number) {
    const wishlistToBeRemoved = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: { owner: true, items: true },
    });

    if (!wishlistToBeRemoved) {
      throw new NotFoundException('Список желаний не найден');
    }

    if (wishlistToBeRemoved.owner.id !== userId) {
      throw new BadRequestException(
        'Список желаний может удалить только владелец',
      );
    }

    await this.wishlistRepository.remove(wishlistToBeRemoved);

    return wishlistToBeRemoved;
  }
}
