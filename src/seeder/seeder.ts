import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { Bank } from 'src/accounts/entities/bank.entity';
import { Category } from 'src/releases/entities/category.entity';
import { InsertBanksSeeder } from './releases/insert-banks-prefixed.seeder';
import { InsertCategoriesSeeder } from './releases/insert-categories-prefixed.seeder';

seeder({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT),
      username: 'postgres',
      password: 'postgres',
      database: process.env.PG_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Category, Bank]),
  ],
}).run([InsertCategoriesSeeder, InsertBanksSeeder]);
