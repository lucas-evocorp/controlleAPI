import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserAuth } from 'src/core/interfaces/user-auth.interface';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async fetchEmailByUser(email: string) {
    return await this.usersRepository.findOne({ email });
  }

  async createUser(createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    return await this.usersRepository.save({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
    });
  }

  async getUserData(usuarioAuth: IUserAuth) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .select([
        'SUM(account.opening_balance)',
        'user.id',
        'user.imageUrl',
        'user.name',
      ])
      .groupBy('user.id')
      .distinct(true)
      .where('user.id = :id', { id: usuarioAuth.userId })
      .getRawOne();
    return {
      id: user.user_id,
      name: user.user_name,
      imageUrl: user.user_image_url,
      openingBalance: user.sum,
    };
  }
}
