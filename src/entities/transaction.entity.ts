import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Concert } from './concert.entity';

export enum TransactionAction {
  RESERVE = 'RESERVE',
  CANCEL = 'CANCEL',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Concert, (concert) => concert.transaction, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'concert_id' })
  concert: Concert;

  @Column()
  username: string;

  @Column({
    type: 'enum',
    enum: TransactionAction,
  })
  action: TransactionAction;

  @CreateDateColumn()
  created_at: Date;
}
