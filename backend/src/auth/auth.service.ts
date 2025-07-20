import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  auth(userId: number) {
    const access_token = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '7d' },
    );

    return { access_token };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findUserIdAndPassword(username);

    if (user && this.hashService.comparePassword(password, user.password)) {
      return user;
    }

    return null;
  }
}
