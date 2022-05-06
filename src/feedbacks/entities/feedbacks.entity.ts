import { Account } from 'src/accounts/entities/account.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'feedbacks' })
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ nullable: true, name: 'image_url' })
  imageUrl?: string;

  @ManyToOne(() => User, (user) => user.feedback)
  @JoinColumn({ name: 'user_id' })
  user: User[];

  @Column({ name: 'user_id' })
  userId: number;
}
