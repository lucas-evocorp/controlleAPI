import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuth } from 'src/core/decorators/user-auth';
import { IUserAuth } from 'src/core/interfaces/user-auth.interface';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountService } from './accounts.service';
import { BanksService } from './banks.service';
import { IResponseApiData } from 'src/core/interfaces/response-api-data';
import { responseApiData } from 'src/core/messages/response-api-data-message';

@ApiTags('accounts')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('api/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async createAccount(
    @UserAuth() usuarioAuth: IUserAuth,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<IResponseApiData> {
    const account = await this.accountService.createAccount(
      usuarioAuth,
      createAccountDto,
    );
    return responseApiData(account);
  }

  @Get()
  async getAccounts(@UserAuth() usuarioAuth: IUserAuth) {
    const accounts = await this.accountService.getAccounts(usuarioAuth);
    return { accounts };
  }

  @Get('to-filter')
  async getAccountsToFilter(@UserAuth() usuarioAuth: IUserAuth) {
    const accounts = await this.accountService.getAccountsToFilter(usuarioAuth);
    return { accountsToFilter: accounts };
  }
}
