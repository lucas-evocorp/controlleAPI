import { Account } from 'src/accounts/entities/account.entity';
import { Feedback } from 'src/feedbacks/entities/feedbacks.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, name: 'image_url' })
  imageUrl?: string;

  @OneToMany(() => Account, (account) => account.user)
  account?: Account[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedback: Feedback[];
}
