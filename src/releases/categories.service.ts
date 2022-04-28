import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getCategoriesToFilter() {
    const categories = await this.categoryRepository.find();
    categories.unshift({ id: 0, name: 'todas as categorias' });

    return categories;
  }

  async getCategories() {
    const categories = await this.categoryRepository.find();

    return categories;
  }
}
