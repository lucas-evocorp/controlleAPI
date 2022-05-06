import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountModule } from './accounts/accounts.module';
import { releasesModule } from './releases/releases.module';
import { FeedBackModule } from './feedbacks/feedbacks.module';
import { MulterModule } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT),
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UsersModule,
    MulterModule.register({
      dest: './upload',
    }),
    AccountModule,
    releasesModule,
    FeedBackModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
