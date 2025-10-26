import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Concert } from 'src/entities/concert.entity';
import { Transaction } from 'src/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Concert, Transaction])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
