import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async createWish(userId: number, createWishDto: CreateWishDto) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: user,
    });

    const createdWish = await this.wishRepository.save(wish);

    const newWish = await this.wishRepository.findOneBy({ id: createdWish.id });

    return newWish;
  }

  async findTopWishes() {
    const wishes = await this.wishRepository.find({
      order: { copied: 'DESC' },
      skip: 0,
      take: 20,
    });

    return wishes;
  }

  async findLastWishes() {
    const wishes = await this.wishRepository.find({
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 40,
    });

    return wishes;
  }

  async findWishById(wishId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: { owner: true, offers: { user: true } },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return wish;
  }

  async updateWish(
    userId: number,
    wishId: number,
    updateWishDto: UpdateWishDto,
  ) {
    const wishToBeUpdated = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });

    if (!wishToBeUpdated) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wishToBeUpdated.owner.id !== userId) {
      throw new BadRequestException('Нельзя редактировать чужие подарки');
    }

    if (updateWishDto.price && wishToBeUpdated.raised > 0) {
      throw new BadRequestException(
        'Нельзя изменять стоимость подарка, если уже есть желающие скинуться',
      );
    }

    await this.wishRepository.update(wishId, updateWishDto);

    const updatedWish = await this.wishRepository.findOneBy({ id: wishId });

    return updatedWish;
  }

  async copyWish(userId: number, wishId: number) {
    const wishToBeCopied = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });

    if (!wishToBeCopied) {
      throw new NotFoundException('Подарок не найден');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { wishes: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    wishToBeCopied.copied++;

    await this.wishRepository.save(wishToBeCopied);

    const copiedWish = this.wishRepository.create(wishToBeCopied);

    await this.wishRepository.insert({
      ...copiedWish,
      copied: 0,
      raised: 0,
      owner: user,
    });

    return copiedWish;
  }

  async removeWish(userId: number, wishId: number) {
    const wishToBeRemoved = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });

    if (!wishToBeRemoved) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wishToBeRemoved.owner.id !== userId) {
      throw new BadRequestException('Нельзя удалять чужие подарки');
    }

    await this.wishRepository.remove(wishToBeRemoved);

    return wishToBeRemoved;
  }
}
