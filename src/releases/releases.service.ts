import {
  BadRequestException,
  HttpCode,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
require('dayjs/locale/pt-br');
import { IUserAuth } from 'src/core/interfaces/user-auth.interface';
import { Account } from 'src/accounts/entities/account.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UpdateReleaseValueDto } from './dto/updte-release-value.dto';
import { CreateReleaseDto } from './dto/create-release.dto';
import { payReleaseDto } from './dto/pay-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto ';
import { Category } from './entities/category.entity';
import { Release } from './entities/releases.entity';
import { v4 as uuidv4 } from 'uuid';
import { UpdateTypeDto } from './dto/update-release-type.dto ';
import { SearchDto } from './dto/search.dto';
import { AccountService } from 'src/accounts/accounts.service';
import { typeEnum } from 'src/core/interfaces/type-enum';
import {
  timeCourseEnum,
  timeCourseFilterDto,
} from './dto/time-course-filter.dto';

interface IListReleaseDetailsResponse {
  releaseDetails: Release;
  category: Category;
  account: Account;
}

interface IDateFilterResponse {
  initialDate: string;
  finalDate: string;
}

enum amountEnum {
  FULL = 'full',
  MORE_THAN = 'more-than',
  JUST_THIS = 'just-this',
}

interface IDeleteReleaseResponse {
  key: number | string;
  count?: number | string;
}

interface ApplyFiltersParams {
  release: SelectQueryBuilder<Release>;
  type: string;
  category: string;
  account: number;
  search: SearchDto;
  usuarioAuth: IUserAuth;
}

interface IPrevisionParams {
  release: SelectQueryBuilder<Release>;
  fullBalanceValue: number;
  allPaidReleasesValue: number;
  date: IDateFilterResponse;
}
export interface IReleaseSumResponse {
  sum: number;
}
export interface IListReleasesParams {
  date: string;
  filter: timeCourseFilterDto;
  type: string;
  account: number;
  category: string;
  usuarioAuth: IUserAuth;
  search: SearchDto;
}
export interface IListReleasesResponse {
  releases: SelectQueryBuilder<Release>;
}

export interface IReleaseResponse {
  releases;
  prevision;
  balance;
}
interface IPrevisionResponse {
  expectedRecipe: number;
  expectedExpense: number;
  totalExpected: number;
}

interface IBalanceResponse {
  realizedRecipe: Release;
  realizedExpense: Release;
  totalBalance: number;
}

interface IBalanceParams {
  release: SelectQueryBuilder<Release>;
  fullBalanceValue: number;
  allPaidReleasesValue: number;
  date: IDateFilterResponse;
}
enum releaseCategoryEnum {
  OTHERS = 'Outros',
}

enum typeReleasesToFilterEnum {
  ALL_RELEASES = 'todos-os-lancamentos',
  PAY_RECIPES = 'receitas-recebidas',
  PAY_EXPENSES = 'despesas-pagas',
  UNPAID_RECIPES = 'receitas-nao-recebidas',
  UNPAID_EXPENSES = 'despesas-nao-pagas',
  RECIPES = 'receitas',
  EXPENSES = 'despesas',
}

@Injectable()
export class ReleaseService {
  constructor(
    @InjectRepository(Release)
    private releaseRepository: Repository<Release>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async CreateRelease(
    createReleaseDto: CreateReleaseDto,
    installment: number,
    timeCourse: string,
    usuarioAuth: IUserAuth,
  ): Promise<Release | Release[]> {
    const release = new Release();
    release.description = createReleaseDto.description;
    release.value = createReleaseDto.value;
    release.categoryId = createReleaseDto.categoryId;
    release.accountId = createReleaseDto.accountId;
    release.emission = createReleaseDto.emission;
    release.dueDate = createReleaseDto.dueDate;
    release.payDay = createReleaseDto.payDay;
    release.type = createReleaseDto.type;
    release.paidOut = createReleaseDto.paidOut;
    release.orderedListing = createReleaseDto.dueDate;
    release.fixed = createReleaseDto.fixed;
    release.installments = createReleaseDto.installments;
    release.releaseAt = new Date();

    const handleRelease = await this.handleRelease(
      usuarioAuth,
      createReleaseDto,
      release,
    );

    if (
      createReleaseDto.fixed === true &&
      createReleaseDto.installments === true
    ) {
      throw new BadRequestException('verifique os campos e tente novamente');
    } else if (createReleaseDto.fixed === true) {
      const fixedRelease = await this.createFixedRelease(
        handleRelease,
        createReleaseDto,
        timeCourse,
      );

      return fixedRelease;
    } else if (createReleaseDto.installments === true) {
      const installmentRelease = await this.createInstallmentRelease(
        handleRelease,
        installment,
        timeCourse,
        createReleaseDto,
      );
      return installmentRelease;
    } else {
      const simpleRelease = await this.createSimpleRelease(handleRelease);

      return simpleRelease;
    }
  }

  async createSimpleRelease(release: Release) {
    const saveSimpleRelease = await this.releaseRepository.save(release);

    return saveSimpleRelease;
  }

  async createInstallmentRelease(
    release: Release,
    installment: number,
    timeCourse: string,
    createReleaseDto: CreateReleaseDto,
  ) {
    const installmentRelease = await this.handleinstallmentRelease(
      release,
      createReleaseDto,
      installment,
      timeCourse,
    );
    const saveInstallmentRelease = await this.releaseRepository.save(
      installmentRelease,
    );
    return saveInstallmentRelease;
  }

  async createFixedRelease(
    release: Release,
    createReleaseDto: CreateReleaseDto,
    timeCourse: string,
  ) {
    const fixedRelease = await this.handleFixedRelease(
      release,
      createReleaseDto,
      timeCourse,
    );
    const saveFixedRelease = await this.releaseRepository.save(fixedRelease);

    console.log('chegou requisição fixo');

    return saveFixedRelease;
  }

  async delayedReleases(usuarioAuth: IUserAuth) {
    const releases = await this.releaseRepository
      .createQueryBuilder('releases')
      .leftJoinAndSelect('releases.account', 'account')
      .where('account.userId = :userId', { userId: usuarioAuth.userId })

      .andWhere('due_date < :date', {
        date: dayjs(new Date()).format('YYYY/MM/DD'),
      })
      .andWhere('paid_out = :paidOut', { paidOut: false })
      .andWhere('type = :type', { type: 'despesa' })
      .getManyAndCount();

    return releases;
  }

  async listReleaseDetails(
    id: number,
    usuarioAuth: IUserAuth,
  ): Promise<IListReleaseDetailsResponse> {
    const releaseDetails = await this.releaseRepository.findOne(id);
    if (!releaseDetails) {
      throw new BadRequestException(
        'Ops! verifique se esse lançamento realmente esta registrado na sua conta',
      );
    }

    const account = await this.accountRepository.findOne(
      releaseDetails.accountId,
    );
    const category = await this.categoryRepository.findOne(
      releaseDetails.categoryId,
    );
    if (account.userId === usuarioAuth.userId) {
      return {
        releaseDetails,
        category,
        account,
      };
    }
    throw new BadRequestException(
      'Busca invalida, por favor, verifique se você realmente registrou esse lançamento',
    );
  }

  private async releaseQueryBuilder(
    usuarioAuth: IUserAuth,
  ): Promise<SelectQueryBuilder<Release>> {
    const release = this.releaseRepository
      .createQueryBuilder('releases')
      .leftJoinAndSelect('releases.account', 'account')
      .leftJoinAndSelect('releases.category', 'category')

      .where('account.user_id = :userId', {
        userId: usuarioAuth.userId,
      })

      .select([
        'releases.id',
        'releases.description',
        'releases.value',
        'releases.paidOut',
        'releases.type',
        'category.name',
        'account.name',
        'releases.ordered_listing',
      ]);
    return release;
  }

  private async releaseQueryBuilderFiltered(
    params: IListReleasesParams,
  ): Promise<SelectQueryBuilder<Release>> {
    const { account, category, date, filter, type, usuarioAuth, search } =
      params;
    const dateFilter = await this.dateFilter(date, filter);

    const releasesFilteredsToDate = this.releaseRepository
      .createQueryBuilder('releases')
      .leftJoinAndSelect('releases.account', 'account')
      .leftJoinAndSelect('releases.category', 'category')
      .where('account.userId = :userId', {
        userId: usuarioAuth.userId,
      })
      .andWhere(
        `ordered_listing BETWEEN '${dateFilter.initialDate.toString()}' AND '${dateFilter.finalDate.toString()}'`,
      )
      .select([
        'releases.id',
        'releases.description',
        'releases.value',
        'releases.paidOut',
        'releases.type',
        'category.name',
        'account.name',
        'releases.ordered_listing',
        'releases.installments',
        'releases.fixed',
      ]);

    await this.applyFilters({
      release: releasesFilteredsToDate,
      type,
      category,
      account,
      search,
      usuarioAuth,
    });

    return releasesFilteredsToDate;
  }

  async releaseFilteredSum(release: SelectQueryBuilder<Release>) {
    return release.select('SUM(value)').getRawOne();
  }

  async listReleasesAndValues(
    params: IListReleasesParams,
  ): Promise<IReleaseResponse> {
    const { account, category, date, filter, type, usuarioAuth, search } =
      params;

    const releaseFiltered = await this.releaseQueryBuilderFiltered({
      usuarioAuth,
      date,
      filter,
      type,
      account,
      category,
      search,
    });
    const release = await this.releaseQueryBuilder(usuarioAuth);
    const fullBalanceValue = await this.fullBalanceSum(usuarioAuth);
    const allReleasesSum = await this.allPaidReleasesSum(usuarioAuth);
    const dateFilter = await this.dateFilter(date, filter);
    const listReleases = await releaseFiltered.getMany();

    const prevision = await this.previsionSum({
      release,
      fullBalanceValue: fullBalanceValue.sum,
      allPaidReleasesValue: allReleasesSum.sum,
      date: dateFilter,
    });
    const balance = await this.balanceSum({
      release,
      fullBalanceValue: fullBalanceValue.sum,
      allPaidReleasesValue: allReleasesSum.sum,
      date: dateFilter,
    });

    return {
      releases: listReleases,
      prevision: prevision,
      balance: balance,
    };
  }

  async allPaidReleasesSum(
    usuarioAuth: IUserAuth,
  ): Promise<IReleaseSumResponse> {
    const allReleasesSum = await this.releaseRepository
      .createQueryBuilder('releases')
      .leftJoinAndSelect('releases.account', 'account')
      .andWhere('account.user_id = :userId', { userId: usuarioAuth.userId })
      .andWhere('paid_out = :paidOut', { paidOut: true })
      .select('SUM(value)')
      .getRawOne();
    return allReleasesSum;
  }

  async fullBalanceSum(usuarioAuth: IUserAuth): Promise<IReleaseSumResponse> {
    const fullBalanceSum = await this.accountRepository
      .createQueryBuilder('accounts')
      .andWhere('user_id = :userId', { userId: usuarioAuth.userId })
      .select('SUM(opening_balance)')
      .getRawOne();

    return fullBalanceSum;
  }

  async filterReleaseByType(
    release: SelectQueryBuilder<Release>,
    type: string,
  ) {
    switch (type) {
      case typeReleasesToFilterEnum.ALL_RELEASES:
        release.getMany();
        break;
      case typeReleasesToFilterEnum.RECIPES:
        release.andWhere('type = :recipes', { recipes: 'receita' });
        break;
      case typeReleasesToFilterEnum.PAY_RECIPES:
        release
          .andWhere('type = :recipes', { recipes: 'receita' })
          .andWhere('paid_out = :paidOut', { paidOut: true });
        break;
      case typeReleasesToFilterEnum.UNPAID_RECIPES:
        release
          .andWhere('type = :recipes', { recipes: 'receita' })
          .andWhere('paid_out = :paidOut', { paidOut: false });

        break;
      case typeReleasesToFilterEnum.EXPENSES:
        release.andWhere('type = :expenses', { expenses: 'despesa' });
        break;
      case typeReleasesToFilterEnum.PAY_EXPENSES:
        release
          .andWhere('type = :expenses', { expenses: 'despesa' })
          .andWhere('paid_out = :paidOut', { paidOut: true });
        break;
      case typeReleasesToFilterEnum.UNPAID_EXPENSES:
        release
          .andWhere('type = :expenses', { expenses: 'despesa' })
          .andWhere('paid_out = :paidOut', { paidOut: false });
        break;
    }
  }

  async applyFilters(params: ApplyFiltersParams) {
    const { account, category, type, release, search } = params;
    if (type) await this.filterReleaseByType(release, type);
    if (category) await this.filterReleaseByCategory(release, category);
    if (account) await this.filterReleaseByAccount(release, account);
    if (search) await this.searchReleases(release, search);
  }

  async searchReleases(
    release: SelectQueryBuilder<Release>,
    search: SearchDto,
  ) {
    release.andWhere('releases.description ILIKE :description', {
      description: `%${search}%`,
    });
  }

  async filterReleaseByCategory(
    release: SelectQueryBuilder<Release>,
    category: string,
  ) {
    const categoryReplace = category.replace(
      'todas as categorias',
      'todas-as-categorias',
    );

    if (categoryReplace === 'todas-as-categorias') {
      await release.getMany();
    } else {
      await release
        .andWhere('category.name ILIKE :category', {
          category: `%${category}%`,
        })
        .getMany();
    }
  }

  async filterReleaseByAccount(
    release: SelectQueryBuilder<Release>,
    account: number,
  ) {
    if (account == 0) {
      await release.getMany();
    } else {
      console.log('entrou no else');
      await release
        .andWhere('account.id  = :account', { account: account })
        .getMany();
    }
  }

  async previsionSum(params: IPrevisionParams): Promise<IPrevisionResponse> {
    const { allPaidReleasesValue, date, fullBalanceValue, release } = params;

    const expenses = await release
      .andWhere('type = :type', { type: 'despesa' })
      .andWhere('ordered_listing <= :date', {
        date: date.finalDate,
      })
      .select('SUM(value)')
      .getRawOne();

    const recipes = await release
      .andWhere('type = :type', { type: 'receita' })
      .andWhere('ordered_listing <= :date', {
        date: date.finalDate,
      })
      .select('SUM(value)')
      .getRawOne();

    if (!recipes.sum) {
      recipes.sum = 0;
    }
    if (!expenses.sum) {
      expenses.sum = 0;
    }

    const totalReleasesValue = recipes.sum + expenses.sum;
    const openingBalance = fullBalanceValue - allPaidReleasesValue;
    const totalPrevision = openingBalance + totalReleasesValue;

    return {
      expectedRecipe: recipes.sum,
      expectedExpense: expenses.sum,
      totalExpected: totalPrevision,
    };
  }

  async balanceSum(params: IBalanceParams): Promise<IBalanceResponse> {
    const { release, fullBalanceValue, allPaidReleasesValue, date } = params;
    const expenses = await release
      .andWhere('paid_out = :paidOut', { paidOut: true })
      .select('SUM(value)')
      .andWhere('type = :type', { type: 'despesa' })
      .andWhere('ordered_listing <= :date', {
        date: date.finalDate,
      })
      .getRawOne();

    const recipes = await release
      .andWhere('paid_out = :paidOut', { paidOut: true })

      .select('SUM(value)')
      .andWhere('type = :type', { type: 'receita' })
      .andWhere('ordered_listing <= :date', {
        date: date.finalDate,
      })
      .getRawOne();

    if (!recipes.sum) {
      recipes.sum = 0;
    }
    if (!expenses.sum) {
      expenses.sum = 0;
    }

    const totalReleasesValue = recipes.sum + expenses.sum;
    const openingBalance = fullBalanceValue - allPaidReleasesValue;
    const totalBalance = openingBalance + totalReleasesValue;

    return {
      realizedRecipe: recipes.sum,
      realizedExpense: expenses.sum,
      totalBalance: totalBalance,
    };
  }

  async removeRelease(
    id: number,
    usuarioAuth: IUserAuth,
    amount: string,
  ): Promise<IDeleteReleaseResponse> {
    const release = await this.releaseRepository.findOne(id);
    if (!release) {
      throw new BadRequestException('Ops... esse lançamento não existe');
    }

    const account = await this.accountRepository.findOne(release.accountId);

    if (account.userId !== usuarioAuth.userId) {
      throw new BadRequestException(
        'Verifique se esse lançamento realmente foi registrado na sua conta',
      );
    } else if (release.batch) {
      const deleteLoopingRelease = await this.deleteLoopingRelease(
        release,
        account,
        amount,
      );
      return deleteLoopingRelease;
    } else {
      const deleteSimpleRelease = await this.deleteSimpleRelease(
        release,
        account,
      );
      return deleteSimpleRelease;
    }
  }

  async deleteLoopingRelease(
    release: Release,
    account: Account,
    amount: string,
  ) {
    const fixedsReleases = this.releaseRepository
      .createQueryBuilder('releases')
      .where('releases.batch = :batch', { batch: release.batch });

    if (amount === amountEnum.MORE_THAN) {
      fixedsReleases.andWhere('releases.ordered_listing >= :orderedListing', {
        orderedListing: release.orderedListing,
      });
    } else if (amount === amountEnum.JUST_THIS) {
      fixedsReleases.andWhere('releases.ordered_listing = :orderedListing', {
        orderedListing: release.orderedListing,
      });
    }

    const getFixedsReleases = await fixedsReleases.getMany();
    const fixedsReleasesSum = await fixedsReleases
      .select('SUM(value)')
      .getRawOne();
    const count = await fixedsReleases.getCount();

    if (release.paidOut) {
      account.openingBalance = account.openingBalance - fixedsReleasesSum.sum;
      await this.accountRepository.update(account.id, account);
      await this.releaseRepository.remove(getFixedsReleases);
      return { key: release.batch, count };
    }
    await this.releaseRepository.remove(getFixedsReleases);
    return { key: release.batch, count };
  }

  async deleteSimpleRelease(release: Release, account: Account) {
    if (release.paidOut) {
      account.openingBalance = account.openingBalance - release.value;

      await this.accountRepository.update(account.id, account);

      await this.releaseRepository.delete(release.id);
      return { key: release.id };
    }
    await this.releaseRepository.delete(release.id);
    return { key: release.id };
  }

  async changeRelease(id: number, updateLançamentoDto: UpdateReleaseDto) {
    const release = await this.releaseRepository.findOne(id);

    if (!release.paidOut) {
      release.orderedListing = updateLançamentoDto.dueDate;
    }

    await this.releaseRepository.update(id, release);
    await this.releaseRepository.update(id, updateLançamentoDto);
    return id;
  }

  async changeReleaseType(id: number, updateTypeDto: UpdateTypeDto) {
    const release = await this.releaseRepository.findOne(id);

    if (!release) {
      throw new BadRequestException(
        'Ops! verifique se esse lançamento esta realmente registrado na sua conta.',
      );
    }

    const account = await this.accountRepository.findOne(release.accountId);

    if (updateTypeDto.type === typeEnum.RECIPE) {
      await this.changeToRecipe(id, updateTypeDto, account, release);
      return release.id;
    } else {
      await this.changeToExpense(id, updateTypeDto, account, release);
      return release.id;
    }
  }

  //o valor do lançamento vem negativo
  async changeToRecipe(
    id: number,
    updateTypeDto: UpdateTypeDto,
    account: Account,
    release: Release,
  ) {
    const value = Math.abs(release.value);
    if (release.paidOut === true && release.type === typeEnum.EXPENSE) {
      release.value = value;
      account.openingBalance = account.openingBalance + release.value * 2;

      await this.accountRepository.update(account.id, account);

      return release;
    }

    release.value = value;

    await this.releaseRepository.update(id, release);
    await this.releaseRepository.update(id, updateTypeDto);
    return release;
  }

  //o valor do lançamento vem positivo
  async changeToExpense(
    id: number,
    updateTypeDto: UpdateTypeDto,
    account: Account,
    release: Release,
  ) {
    const value = await this.forceNegativeValue(release.value);

    if (release.paidOut === true && release.type === 'receita') {
      release.value = value;
      account.openingBalance = account.openingBalance + release.value * 2;
      await this.accountRepository.update(account.id, account);
    }
    release.value = value;
    await this.releaseRepository.update(id, release);
    await this.releaseRepository.update(id, updateTypeDto);
    return release;
  }

  async forceNegativeValue(value: number) {
    const convertValue = Math.abs(value) * -1;
    return convertValue;
  }

  async changeReleaseValue(
    id: number,
    updateReleaseValueDto: UpdateReleaseValueDto,
  ): Promise<Release> {
    const release = await this.releaseRepository.findOne(id);
    const account = await this.accountRepository.findOne({
      where: { id: release.accountId },
    });
    if (release.value != updateReleaseValueDto.value) {
      if (release.type === typeEnum.RECIPE) {
        const changeRecipeValue = await this.changeRecipeValue(
          updateReleaseValueDto,
          id,
          account,
          release,
        );
        return changeRecipeValue;
      } else {
        const changeExpenseValue = await this.changeExpenseValue(
          updateReleaseValueDto,
          id,
          account,
          release,
        );
        return changeExpenseValue;
      }
    }
    await this.releaseRepository.update(id, updateReleaseValueDto);
  }

  async changeRecipeValue(
    updateReleaseValueDto: UpdateReleaseValueDto,
    id: number,
    account: Account,
    release: Release,
  ) {
    const value = Math.abs(updateReleaseValueDto.value);
    const openingBalance = account.openingBalance - release.value;
    account.openingBalance = openingBalance + value;
    await this.releaseRepository.update(id, updateReleaseValueDto);
    await this.accountRepository.update(account.id, account);
    return release;
  }

  async changeExpenseValue(
    updateReleaseValueDto: UpdateReleaseValueDto,
    id: number,
    account: Account,
    release: Release,
  ) {
    const value = await this.forceNegativeValue(updateReleaseValueDto.value);
    const openingBalance = account.openingBalance - release.value;
    account.openingBalance = openingBalance + value;
    await this.releaseRepository.update(id, updateReleaseValueDto);
    await this.accountRepository.update(account.id, account);
    return release;
  }

  async payRelease(id: number, updateLançamentoDto: payReleaseDto) {
    const release = await this.releaseRepository.findOne(id);
    const account = await this.accountRepository.findOne({
      where: { id: release.accountId },
    });

    if (release.type === typeEnum.RECIPE) {
      return await this.handlePostingRelease(
        account,
        release,
        updateLançamentoDto,
      );
    } else if (release.type === typeEnum.EXPENSE) {
      return await this.handlePostingRelease(
        account,
        release,
        updateLançamentoDto,
      );
    }
    throw new BadRequestException(
      'Parece que tem algo errado... Verifique os campos e tente novamente',
    );
  }

  async handlePostingRelease(
    account: Account,
    release: Release,
    updateReleaseDto: payReleaseDto,
  ) {
    if (updateReleaseDto.paidOut === true && release.paidOut === false) {
      account.openingBalance = account.openingBalance + release.value;

      if (!updateReleaseDto.payDay) {
        updateReleaseDto.payDay = new Date();
        release.orderedListing = updateReleaseDto.payDay;
      } else {
        release.orderedListing = updateReleaseDto.payDay;
      }
    } else if (updateReleaseDto.paidOut === false && release.paidOut === true) {
      account.openingBalance = account.openingBalance - release.value;
      release.payDay = null;
      release.orderedListing = release.dueDate;
    } else {
      throw new BadRequestException('Você não pode realizar esta ação!');
    }
    await this.accountRepository.update(account.id, account);
    await this.releaseRepository.update(release.id, release);
    await this.releaseRepository.update(release.id, updateReleaseDto);
    return release.id;
  }

  async dateFilter(
    date: string,
    filter: timeCourseFilterDto,
  ): Promise<IDateFilterResponse> {
    const { timeCourseFilter } = filter;

    if (timeCourseFilter === timeCourseEnum.MONTH) {
      const initialDate = dayjs(date).startOf('month').format('YYYY-MM-DD');
      const finalDate = dayjs(date).endOf('month').format('YYYY-MM-DD');
      return { initialDate, finalDate };
    } else if (timeCourseFilter === timeCourseEnum.WEEK) {
      const initialDate = dayjs(date).format('YYYY-MM-DD');
      const finalDate = dayjs(date).add(7, 'day').format('YYYY-MM-DD');
      return { initialDate, finalDate };
    } else {
      const initialDate = dayjs(date).format('YYYY-MM-DD');
      const finalDate = dayjs(date).format('YYYY-MM-DD');
      return {
        initialDate: initialDate.toString(),
        finalDate: finalDate.toString(),
      };
    }
  }

  async handleRelease(
    usuarioAuth: IUserAuth,
    createReleaseDto: CreateReleaseDto,
    release: Release,
  ): Promise<Release> {
    const account = await this.accountRepository.findOne(
      createReleaseDto.accountId,
    );
    if (!account) {
      throw new NotFoundException('ops! Conta não encontrada.');
    } else if (!release.description.length) {
      release.description = 'outros';
    } else if (release.paidOut) {
      account.openingBalance = account.openingBalance + release.value;

      this.handleReleasePayDay(release, createReleaseDto);

      await this.accountRepository.update(account.id, account);
    }

    await this.handleReleaseType(release);

    await this.handleReleaseCategory(release);
    await this.handleReleaseAccount(release, usuarioAuth);

    return release;
  }

  async handleReleaseCategory(release: Release) {
    const getCategoryByName = await this.categoryRepository.findOne({
      name: releaseCategoryEnum.OTHERS,
    });
    const getCategoryId = await this.categoryRepository.findOne(
      release.categoryId,
    );

    if (!getCategoryId) {
      throw new NotFoundException('ops! Categoria não encontrada');
    }

    if (!release.categoryId) release.categoryId = getCategoryByName.id;

    return release;
  }

  async handleReleaseAccount(release: Release, usuarioAuth: IUserAuth) {
    const account = await this.accountRepository.findOne(release.accountId);
    if (account.userId !== usuarioAuth.userId) {
      throw new NotFoundException('Ops! Conta não encontrada.');
    }

    return release;
  }

  async handleReleaseType(release: Release) {
    if (release.type === typeEnum.EXPENSE) {
      this.forceNegativeValue(release.value);
    } else {
      Math.abs(release.value);
    }
    return release;
  }

  async handleReleasePayDay(
    release: Release,
    createReleaseDto: CreateReleaseDto,
  ) {
    if (release.payDay && release.paidOut === true) {
      release.payDay = createReleaseDto.payDay;
      release.orderedListing = release.payDay;
    } else if (!release.payDay && release.paidOut) {
      release.payDay = new Date();
      release.orderedListing = new Date();
    } else if (release.payDay && release.paidOut === false) {
      release.payDay == null;
    }
  }

  async handleinstallmentRelease(
    release: Release,
    createReleaseDto: CreateReleaseDto,
    installment: number,
    timeCourse: any,
  ): Promise<Release[]> {
    const releasesArray = [];
    if (createReleaseDto.installments === true) {
      const uuid = uuidv4();

      let i = 0;
      for (i; i < installment; i++) {
        const account = await this.accountRepository.findOne(release.accountId);

        release.description = `${createReleaseDto.description} ${
          i + 1
        }/${installment}`;

        release.batch = uuid;

        release.value = Math.round(createReleaseDto.value / installment);

        if (release.type === 'despesa') {
          release.value = (createReleaseDto.value * -1) / installment;

          switch (release.paidOut) {
            case true:
              account.openingBalance = account.openingBalance + release.value;
              await this.accountRepository.update(account.id, account);
              break;
          }
        } else {
          switch (release.paidOut) {
            case true:
              account.openingBalance = account.openingBalance + release.value;
              await this.accountRepository.update(account.id, account);
              break;
          }
        }

        releasesArray.push({
          description: release.description,
          value: release.value,
          categoryId: release.categoryId,
          accountId: release.accountId,
          emission: release.emission,
          dueDate: dayjs(release.dueDate)
            .add(i, `${timeCourse}`)
            .format('YYYY-MM-DD'),
          payDay: release.payDay,
          type: release.type,
          paidOut: release.paidOut,
          orderedListing: dayjs(release.orderedListing)
            .add(i, `${timeCourse}`)
            .format('YYYY-MM-DD'),
          installments: createReleaseDto.installments,
          fixed: false,
          batch: uuid,
          releaseAt: new Date(),
        });
      }
    }

    return releasesArray;
  }

  async handleFixedRelease(
    release: Release,
    createReleaseDto: CreateReleaseDto,
    timeCourse: string,
  ): Promise<Release[]> {
    if (createReleaseDto.fixed === true) {
      const uuid = uuidv4();
      const releasesArray = [];
      let i = 0;
      let value = 1;
      const account = await this.accountRepository.findOne(release.accountId);

      switch (timeCourse) {
        case 'month':
          value = 91;
          break;
        case 'year':
          value = 5;
          break;
        case 'day':
          value = 1340;
          break;
        case 'week':
          value = 401;
      }

      for (i; i < value; i++) {
        if (release.type === 'despesa') {
          release.value = createReleaseDto.value * -1;

          switch (release.paidOut) {
            case true:
              account.openingBalance = account.openingBalance + release.value;
              await this.accountRepository.update(account.id, account);
              break;
            case false:
          }
        } else {
          switch (release.paidOut) {
            case true:
              account.openingBalance = account.openingBalance + release.value;
              await this.accountRepository.update(account.id, account);
              break;
          }
        }

        releasesArray.push({
          description: release.description,
          value: release.value,
          categoryId: release.categoryId,
          accountId: release.accountId,
          emission: release.emission,
          dueDate: dayjs(release.dueDate)
            .add(i, `${timeCourse}`)
            .format('YYYY-MM-DD'),
          payDay: release.payDay,
          type: release.type,
          paidOut: release.paidOut,
          orderedListing: dayjs(release.orderedListing)
            .add(i, `${timeCourse}`)
            .format('YYYY-MM-DD'),
          installments: false,
          fixed: createReleaseDto.fixed,
          batch: uuid,
          releaseAt: new Date(),
        });
      }
      return releasesArray;
    }
  }
}
