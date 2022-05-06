import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';

export interface IValidateUserResponse {
  user: {
    id: number;
    email: string;
    username: string;
    imageUrl: string;
  };
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtservice: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<IValidateUserResponse> {
    const user = await this.usersService.fetchEmailByUser(loginDto.email);

    if (!user) {
      throw new BadRequestException('Email ou senha incorreta');
    }
    if ((await bcrypt.compare(loginDto.password, user.password)) === false) {
      throw new BadRequestException('Email ou senha incorreta');
    }

    const typeuser = {
      id: user.id,
      email: user.email,
      username: user.name,
      imageUrl: user.imageUrl,
    };

    const payload = { username: user.email, sub: user.id };
    const token = this.jwtservice.sign(payload);

    return {
      user: typeuser,
      access_token: token,
    };
  }
}
