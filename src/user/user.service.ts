import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from 'src/entities/concert.entity';
import {
  Transaction,
  TransactionAction,
} from 'src/entities/transaction.entity';
import { CancelDto, GetMyConcertQueryDto, ReserveDto } from './dto/request.dto';
import { plainToInstance } from 'class-transformer';
import { ConcertResponseDto } from './dto/response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Concert)
    private readonly concertRepository: Repository<Concert>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getConcerts() {
    const qb = this.concertRepository
      .createQueryBuilder('concert')
      .addSelect((subQ) => {
        return subQ
          .select('t2.action')
          .from(Transaction, 't2')
          .where('t2.concert_id = concert.id')
          .andWhere('t2.username = :username', { username: 'testuser' })
          .orderBy('t2.created_at', 'DESC')
          .limit(1);
      }, 'last_action');

    const { raw, entities } = await qb.getRawAndEntities();

    const merged = entities.map((concert, i) => {
      const lastAction = raw[i]?.last_action as
        | TransactionAction
        | null
        | undefined;
      return {
        ...concert,
        isReserved: lastAction === TransactionAction.RESERVE,
      };
    });

    return plainToInstance(ConcertResponseDto, merged, {
      excludeExtraneousValues: true,
    });
  }

  async reserveConcert(reserveDto: ReserveDto) {
    try {
      const concert = await this.concertRepository.findOne({
        where: { id: reserveDto.concertId },
      });

      // Reserve concert
      const transaction = new Transaction();
      transaction.concert = concert;
      transaction.username = 'testuser'; // for assignment demo only
      transaction.action = TransactionAction.RESERVE;

      await this.transactionRepository.save(transaction);

      return {
        message: 'reserve successfully.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof ConflictException) throw error;
      console.error('Unexpected error in createConcert:', error);
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  async cencelConcert(canceltDto: CancelDto) {
    try {
      const concert = await this.concertRepository.findOne({
        where: { id: canceltDto.concertId },
      });

      // Cancel concert
      const transaction = new Transaction();
      transaction.concert = concert;
      transaction.username = 'testuser'; // for assignment demo only
      transaction.action = TransactionAction.CANCEL;

      await this.transactionRepository.save(transaction);

      return {
        message: 'cancel successfully.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof ConflictException) throw error;
      console.error('Unexpected error in createConcert:', error);
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  async getMyConcerts(query: GetMyConcertQueryDto) {
    const qb = this.concertRepository
      .createQueryBuilder('concert')
      .addSelect((subQ) => {
        return subQ
          .select('t2.action')
          .from(Transaction, 't2')
          .where('t2.concert_id = concert.id')
          .andWhere('t2.username = :username', { username: query.username })
          .orderBy('t2.created_at', 'DESC')
          .limit(1);
      }, 'last_action')
      .having('last_action = :reserve', {
        reserve: TransactionAction.RESERVE,
      });
    qb.groupBy('concert.id');

    const { raw, entities } = await qb.getRawAndEntities();

    const merged = entities.map((concert) => ({
      ...concert,
      isReserved: true,
    }));

    return plainToInstance(ConcertResponseDto, merged, {
      excludeExtraneousValues: true,
    });
  }
}
