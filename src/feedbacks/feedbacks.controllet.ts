import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import path = require('path');
import { UserAuth } from 'src/core/decorators/user-auth';
import { IResponseApiData } from 'src/core/interfaces/response-api-data';
import { IUserAuth } from 'src/core/interfaces/user-auth.interface';
import { responseApiData } from 'src/core/messages/response-api-data-message';
import { SendFeedBackDto } from './dtos/create-feedback.dto';
import { v4 as uuidv4 } from 'uuid';
import { FeedBackService } from './feedbacks.service';

export const storage = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('widget')
@ApiTags('users')
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedBackService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('send-feedback')
  async createFeedback(
    @Body() feedbackData: SendFeedBackDto,
    @UserAuth() userAuth: IUserAuth,
  ): Promise<any> {
    const createFeedback = await this.feedbackService.sendFeedback(
      feedbackData,
      userAuth,
    );
    return responseApiData(createFeedback, 'feedback enviado com sucesso');
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('file-upload/:id')
  @UseInterceptors(FileInterceptor('file', storage))
  async fileUpload(@UploadedFile() file, @Param('id') id: number) {
    const filename = file.filename;
    const upload = await this.feedbackService.sendImage(filename, id);

    return responseApiData(upload);
  }

  @Get('file-upload/:image')
  async getFile(@Param('image') image, @Res() res) {
    return await res.sendFile(image, { root: 'uploads' });
  }
}
