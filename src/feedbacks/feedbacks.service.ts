import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import path from 'path';
import { IUserAuth } from 'src/core/interfaces/user-auth.interface';
import { Repository } from 'typeorm';
import { SendFeedBackDto, TypeFeedbackEnum } from './dtos/create-feedback.dto';
import { Feedback } from './entities/feedbacks.entity';

interface ISendFeedBackResponse {
  description: string;
  type: TypeFeedbackEnum;
  fileName?: string;
}

@Injectable()
export class FeedBackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async sendFeedback(
    sendFeedbackDto: SendFeedBackDto,
    usuarioAuth: IUserAuth,
  ): Promise<ISendFeedBackResponse> {
    const saveFeedback = await this.feedbackRepository.save({
      description: sendFeedbackDto.description,
      type: sendFeedbackDto.type,
      userId: usuarioAuth.userId,
    });

    return saveFeedback;
  }
  async sendImage(filename: string, id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne(id);
    const imageUrl = process.env.URL + filename;
    if (feedback) {
      const saveImageFeedBack = await this.feedbackRepository.save({
        id: feedback.id,
        imageUrl: imageUrl,
      });
      return saveImageFeedBack;
    }
  }
}
