import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IResponseApiData } from 'src/core/interfaces/response-api-data';
import { responseApiData } from 'src/core/messages/response-api-data-message';

import { Repository } from 'typeorm';
import { CreateBankDto } from './dto/create-bank.dto';
import { Bank } from './entities/bank.entity';
@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(Bank) private banksRepository: Repository<Bank>,
  ) {}

  async CreateCustomBank(
    CreateBankDto: CreateBankDto,
  ): Promise<IResponseApiData> {
    const newBank = await this.banksRepository.save(CreateBankDto);
    return responseApiData(newBank);
  }
}
