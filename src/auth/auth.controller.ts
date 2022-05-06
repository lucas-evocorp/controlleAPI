import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// import { IResponseApiData } from 'src/core/interfaces/response-api-data';
import { responseApiData } from 'src/core/messages/response-api-data-message';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

// const { response } = responseApiData;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async validateUser(
    @Body() loginDto: LoginDto,
  ) /*: Promise<IResponseApiData>*/ {
    // const login = await this.authService.validateUser(loginDto);
    // return response('usuario autenticado com sucesso', login);
    return await this.authService.validateUser(loginDto);
  }
}
