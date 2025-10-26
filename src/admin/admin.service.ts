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
import { CreateConcertDto } from './dto/request.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Concert)
    private readonly concertRepository: Repository<Concert>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getConcerts() {
    const concerts = await this.concertRepository.find({});
    return concerts;
  }

  async createConcert(createConcertDto: CreateConcertDto) {
    try {
      const existingConcert = await this.concertRepository.findOne({
        where: [{ name: createConcertDto.name }],
      });
      if (existingConcert) {
        throw new ConflictException('Concert already exists');
      }

      // Create concert
      const concert = new Concert();
      concert.name = createConcertDto.name;
      concert.detail = createConcertDto.detail;
      concert.number_of_seats = createConcertDto.numberOfSeats;
      concert.reserved = 0;

      await this.concertRepository.save(concert);

      return {
        message: 'Concert saved successfully.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof ConflictException) throw error;
      console.error('Unexpected error in createConcert:', error);
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  async deleteConcert(concertId: number) {
    return await this.concertRepository.delete({ id: concertId });
  }

  async getTransactions() {
    const transactions = await this.transactionRepository.find({
      relations: { concert: true },
    });
    return transactions;
  }

  async getConcertTotals() {
    const [seatsRow, reservedRow, cancelRow] = await Promise.all([
      this.concertRepository
        .createQueryBuilder('c')
        .select('COALESCE(SUM(c.number_of_seats), 0)', 'total')
        .getRawOne(),

      this.transactionRepository
        .createQueryBuilder('t')
        .select('COUNT(*)', 'total')
        .where('t.action = :action', { action: TransactionAction.RESERVE })
        .getRawOne(),

      this.transactionRepository
        .createQueryBuilder('t')
        .select('COUNT(*)', 'total')
        .where('t.action = :action', { action: TransactionAction.CANCEL })
        .getRawOne(),
    ]);

    return {
      totalSeats: Number(seatsRow?.total ?? 0),
      totalReserved: Number(reservedRow?.total ?? 0),
      totalCancel: Number(cancelRow?.total ?? 0),
    };
  }
}
