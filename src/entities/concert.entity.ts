import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class Concert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  detail: string;

  @Column()
  number_of_seats: number;

  @Column()
  reserved: number;

  @Column({ nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.concert)
  transaction: Transaction[];
}
