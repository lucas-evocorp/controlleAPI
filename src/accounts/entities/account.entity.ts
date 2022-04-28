import { Release } from 'src/releases/entities/releases.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bank } from './bank.entity';

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Conta Inicial' })
  name: string;

  @Column({ default: 0, name: 'opening_balance', type: 'float' })
  openingBalance: number;

  @OneToMany(() => Release, (release) => release.account)
  release?: Release[];

  @ManyToOne(() => Bank, (bank) => bank.account)
  @JoinColumn({ name: 'bank_id' })
  bank?: Bank[];

  @ManyToOne(() => User, (user) => user.account)
  @JoinColumn({ name: 'user_id' })
  user?: User[];

  @Column({ default: 1, name: 'bank_id' })
  bankId: number;

  @Column({ name: 'user_id' })
  userId: number;
}
