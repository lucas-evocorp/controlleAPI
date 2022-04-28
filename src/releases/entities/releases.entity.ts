import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity({ name: 'releases' })
export class Release {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ default: 0, type: 'float' })
  value: number;

  @Column({ type: 'date' })
  emission: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({
    default: null,
    nullable: true,
    type: 'date',
    name: 'pay_day',
  })
  payDay: Date;

  @ManyToOne(() => Account, (account) => account.release)
  @JoinColumn({ name: 'account_id' })
  account?: Account[];

  @ManyToOne(() => Category, (category) => category.release)
  @JoinColumn({ name: 'category_id' })
  category?: Category[];

  @Column({ nullable: true, name: 'category_id' })
  categoryId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'paid_out', default: false, type: 'boolean' })
  paidOut: boolean;

  @Column()
  type: string;

  @Column({ type: 'date', name: 'ordered_listing' })
  orderedListing: Date;

  @Column({ name: 'installments', default: false })
  installments: boolean;

  @Column({ name: 'fixed', default: false })
  fixed: boolean;

  @Column({ type: 'uuid', nullable: true })
  batch?: number;

  @Column({ name: 'release_at', type: 'timestamp' })
  releaseAt: Date;
}
