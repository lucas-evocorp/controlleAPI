import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Category } from 'src/releases/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InsertCategoriesSeeder implements Seeder {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async seed(): Promise<any> {
    const categories = await this.categoryRepository
      .createQueryBuilder('categories')
      .getCount();
    try {
      if (categories === 0) {
        return this.categoryRepository
          .createQueryBuilder('categories')
          .insert()
          .into(Category)
          .values([
            { name: 'Outros' },
            { name: 'Pensão' },
            { name: 'Aluguel' },
            { name: 'Fatura' },
            { name: 'Energia' },
            { name: 'Agua' },
            { name: 'Aposento' },
            { name: 'Lazer' },
          ])
          .execute();
      }
    } catch (error) {
      new console.error('seeder error');
    }
  }
  async drop(): Promise<any> {
    //não utilizo
  }
}
