import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedbacks.entity';
import { FeedbackController } from './feedbacks.controllet';
import { FeedBackService } from './feedbacks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [FeedBackService],
  exports: [FeedBackService],
})
export class FeedBackModule {}
