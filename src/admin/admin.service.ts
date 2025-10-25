import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from 'src/entities/concert.entity';
import { Transaction } from 'src/entities/transaction.entity';
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
}
