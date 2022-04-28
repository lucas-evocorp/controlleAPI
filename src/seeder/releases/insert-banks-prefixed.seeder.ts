import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Bank } from 'src/accounts/entities/bank.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InsertBanksSeeder implements Seeder {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
  ) {}
  async seed(): Promise<any> {
    const banks = await this.bankRepository
      .createQueryBuilder('banks')
      .getCount();

    try {
      if (banks === 0) {
        return await this.bankRepository
          .createQueryBuilder('banks')
          .insert()
          .into(Bank)
          .values([
            { name: 'Conta Inicial' },
            { name: 'Nubank' },
            { name: 'Digio' },
            { name: 'Picpay' },
            { name: 'Inter' },
            { name: 'caixa' },
            { name: 'banco do brasil' },
            { name: 'zaut' },
            { name: 'PayPal' },
          ])
          .execute();
      }
    } catch (error) {
      new console.error('seeder error');
    }
  }

  async drop(): Promise<any> {
    // nao utilizo
  }
}
