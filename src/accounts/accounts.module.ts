import { Module } from '@nestjs/common';
import { AccountService } from './accounts.service';
import { AccountController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Bank } from './entities/bank.entity';
import { BanksService } from './banks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Bank])],
  controllers: [AccountController],
  providers: [AccountService, BanksService],
})
export class AccountModule {}
