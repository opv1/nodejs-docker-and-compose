import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { HashService } from 'src/hash/hash.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private hashService: HashService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { username, email } = createUserDto;

    const exists = await this.userRepository.exists({
      where: [{ username }, { email }],
    });

    if (exists) {
      throw new ConflictException(
        'Пользователь с таким email или username уже существует',
      );
    }

    const user = this.userRepository.create({
      username: createUserDto.username,
      about: createUserDto.about,
      avatar: createUserDto.avatar,
      email: createUserDto.email,
      password: this.hashService.hashPassword(createUserDto.password),
    });

    const createdUser = await this.userRepository.save(user);

    const newUser = await this.userRepository.findOneBy({ id: createdUser.id });

    return newUser;
  }

  async findUserById(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findUserByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findUserIdAndPassword(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findUserWishes(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { wishes: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes;
  }

  async findUsersByQuery(query: string) {
    const users = await this.userRepository.find({
      where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
    });

    return users;
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const userToBeUpdated = await this.userRepository.findOne({
      where: { id: userId },
      select: { username: true, email: true, password: true },
    });

    if (!userToBeUpdated) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (updateUserDto.password) {
      const { password } = updateUserDto;
      const hashedPassword = this.hashService.hashPassword(password);

      updateUserDto.password = hashedPassword;
    }

    await this.userRepository.update(userId, updateUserDto);

    const updatedUser = await this.userRepository.findOneBy({ id: userId });

    return updatedUser;
  }
}
