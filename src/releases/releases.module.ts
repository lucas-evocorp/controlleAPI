import { Module } from '@nestjs/common';
import { ReleaseService } from './releases.service';
import { releaseController } from './releases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Release } from './entities/releases.entity';
import { Category } from './entities/category.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { User } from 'src/users/entities/user.entity';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Release, Category, Account, User])],
  controllers: [releaseController],
  providers: [ReleaseService, CategoriesService],
})
export class releasesModule {}
