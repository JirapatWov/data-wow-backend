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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Concert)
    private readonly concertRepository: Repository<Concert>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async reserveConcert(reserveDto: ReserveDto) {
    try {
      const existingTransaction = await this.transactionRepository.findOne({
        where: [
          { concert: { id: reserveDto.concertId }, username: 'testuser' },
        ],
      });
      if (existingTransaction) {
        throw new ConflictException('Concert already reserved');
      }

      const concert = await this.concertRepository.findOne({
        where: { id: reserveDto.concertId },
      });

      // Create concert
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
      const existingTransaction = await this.transactionRepository.findOne({
        where: [
          { concert: { id: canceltDto.concertId }, username: 'testuser' },
        ],
      });
      if (!existingTransaction) {
        throw new ConflictException('Reservation not found');
      }

      await this.transactionRepository.delete({
        id: existingTransaction.id,
      });

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
    const concerts = await this.concertRepository.find({
      where: { transaction: { username: query.username } },
    });
    return concerts;
  }
}
