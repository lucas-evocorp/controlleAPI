import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ReleaseService } from './releases.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserAuth } from 'src/core/decorators/user-auth';
import { IUserAuth } from 'src/core/interfaces/user-auth.interface';
import { payReleaseDto } from './dto/pay-release.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateReleaseValueDto } from './dto/updte-release-value.dto';
import { UpdateReleaseDto } from './dto/update-release.dto ';
import { CreateReleaseSwagger } from 'src/releases/swagger/create-lançamento.swagger';
import { BadRequestSwagger } from 'src/releases/swagger/bad-request.swagger';
import { UpdateTypeDto } from './dto/update-release-type.dto ';
import { SearchDto } from './dto/search.dto';
import { CategoriesService } from './categories.service';
import { IResponseApiData } from 'src/core/interfaces/response-api-data';
import { responseApiData } from 'src/core/messages/response-api-data-message';
import { timeCourseFilterDto } from './dto/time-course-filter.dto';

@ApiTags('releases')
@Controller('releases')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class releaseController {
  constructor(
    private readonly releaseService: ReleaseService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get('details/:id')
  async getReleaseDetails(
    @Param('id') id: number,
    @UserAuth() usuarioAuth: IUserAuth,
  ) {
    const releaseDetails = await this.releaseService.listReleaseDetails(
      id,
      usuarioAuth,
    );
    return {
      release: releaseDetails.releaseDetails,
      category: { name: releaseDetails.category.name },
      account: { name: releaseDetails.account.name },
    };
  }

  @Get('late')
  async delayedReleases(
    @UserAuth() usuarioAuth: IUserAuth,
  ): Promise<IResponseApiData> {
    const delayedReleases = await this.releaseService.delayedReleases(
      usuarioAuth,
    );
    return responseApiData(delayedReleases, 'lançamentos por pagar');
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: 201,
    description: 'created',
    type: CreateReleaseSwagger,
  })
  @ApiQuery({
    name: 'timecourse',
    required: false,
  })
  @ApiQuery({
    name: 'installment',
    required: false,
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'unauthorized' })
  @ApiResponse({ status: 400, type: BadRequestSwagger })
  @ApiBearerAuth()
  @Post('newrelease')
  async newRelease(
    @Query('timecourse') timeCourse: string,
    @Query('installment') installment: number,

    @UserAuth() usuarioauth: IUserAuth,
    @Body() createReleaseDto: CreateReleaseDto,
  ): Promise<IResponseApiData> {
    const createRelease = await this.releaseService.CreateRelease(
      createReleaseDto,
      installment,
      timeCourse,
      usuarioauth,
    );
    return responseApiData(
      { release: createRelease },
      'lançamento(os) criado(os) com sucesso',
    );
  }

  @ApiQuery({
    name: 'type',
    required: false,
  })
  @ApiQuery({
    name: 'account',
    required: false,
  })
  @ApiQuery({
    name: 'category',
    required: false,
  })
  @ApiQuery({
    name: 'payment',
    required: false,
  })
  @ApiQuery({
    name: 'timecourse',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  @ApiOkResponse({ status: 200, type: CreateReleaseDto, isArray: true })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ status: 401, description: 'unauthorized' })
  @ApiBearerAuth()
  @Get()
  async findAllReleases(
    @Query('type') type: string,
    @Query('account') account: number,
    @Query('category') category: string,
    @Query('filter') filter: timeCourseFilterDto,
    @Query('date') date: string,
    @Query('search') search: SearchDto,
    @UserAuth() usuarioAuth: IUserAuth,
  ) {
    const listReleases = await this.releaseService.listReleasesAndValues({
      date,
      filter,
      type,
      account,
      category,
      usuarioAuth,
      search,
    });
    return listReleases;
  }

  @Get('categories-to-filter')
  async getCategoriesToFilter() {
    const categories = await this.categoriesService.getCategoriesToFilter();
    return { categoriesToFilter: categories };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.categoriesService.getCategories();
    return { categories };
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOkResponse({ description: 'seu lançamento foi alterado com sucesso' })
  @ApiResponse({ status: 400, type: BadRequestSwagger })
  async updateRelease(
    @Param('id') id: number,
    @Body() updateReleaseDto: UpdateReleaseDto,
  ): Promise<IResponseApiData> {
    const release = await this.releaseService.changeRelease(
      id,
      updateReleaseDto,
    );
    return { message: `Lançamento ${release}, alterado com sucesso!` };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'seu lançamento foi alterado com sucesso' })
  @ApiResponse({ status: 400, type: BadRequestSwagger })
  @Put('pay/:id')
  async payRelease(
    @Param('id') id: number,
    @Body() updateReleaseDto: payReleaseDto,
  ): Promise<IResponseApiData> {
    const release = await this.releaseService.payRelease(id, updateReleaseDto);

    return { message: `Lançamento ${release} alterado com sucesso!` };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'seu lançamento foi alterado com sucesso' })
  @ApiResponse({ status: 400, type: BadRequestSwagger })
  @Put('changetype/:id')
  async changeType(
    @Param('id') id: number,
    @Body() updateTypeDto: UpdateTypeDto,
  ): Promise<IResponseApiData> {
    const release = this.releaseService.changeReleaseType(id, updateTypeDto);
    return { message: `Lançamento ${release} alterado com sucesso!` };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'seu lançamento foi alterado com sucesso' })
  @ApiResponse({ status: 400, type: BadRequestSwagger })
  @Put('changevalue/:id')
  async changeReleasevalue(
    @UserAuth() usuarioAuth: IUserAuth,
    @Param('id') id: number,
    @Body() updateReleaseDto: UpdateReleaseValueDto,
  ): Promise<IResponseApiData> {
    await this.releaseService.changeReleaseValue(id, updateReleaseDto);
    return { message: 'valor do lançamento alterado com sucesso' };
  }

  @ApiQuery({ name: 'amount', required: false })
  @Delete(':id')
  async deleteRelease(
    @Query('amount') amount: string,
    @Param('id')
    id: number,
    @UserAuth() usuarioAuth: IUserAuth,
  ) {
    const release = await this.releaseService.removeRelease(
      id,
      usuarioAuth,
      amount,
    );
    if (!release.count) release.count = '';

    return responseApiData(
      `${release.count} lançamento(os) da chave ${release.key} removido(os) com sucesso!`.trim(),
    );
  }
}
