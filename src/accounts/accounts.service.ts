import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserAuth } from 'src/core/interfaces/user-auth.interface';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';
import { BanksService } from './banks.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly banksService: BanksService,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async createAccount(
    usuarioAuth: IUserAuth,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return await this.accountRepository.save({
      name: createAccountDto.name,
      openingBalance: createAccountDto.openingBalance,
      bankId: createAccountDto.bankId,
      userId: usuarioAuth.userId,
    });
  }

  async getAccountsToFilter(usuarioAuth: IUserAuth): Promise<Account[]> {
    const accounts = await this.accountRepository
      .createQueryBuilder('accounts')
      .where('accounts.user_id = :userId', {
        userId: usuarioAuth.userId,
      })
      .select(['accounts.name', 'accounts.id'])
      .getMany();

    accounts.unshift({
      id: 0,
      name: 'todas as contas',
      bankId: 0,
      openingBalance: 0,
      userId: 0,
    });

    return accounts;
  }

  async getAccounts(usuarioAuth: IUserAuth): Promise<Account[]> {
    const accounts = await this.accountRepository
      .createQueryBuilder('accounts')
      .leftJoinAndSelect('accounts.bank', 'bank')
      .where('accounts.user_id = :userId', {
        userId: usuarioAuth.userId,
      })
      .select([
        'accounts.name',
        'accounts.id',
        'accounts.openingBalance',
        'bank.name',
      ])
      .getMany();

    return accounts;
  }
}
