import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { factory } from 'typescript';
import { Release } from './releases.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Release, (release) => release.category)
  release?: Release[];
}
