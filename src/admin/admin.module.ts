import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Concert } from 'src/entities/concert.entity';
import { Transaction } from 'src/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Concert, Transaction])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
