import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { AdminService } from './admin.service';
import { CreateConcertDto } from './dto/request.dto';
import { ConcertResponseDto, TransactionResponseDto } from './dto/response.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('concerts')
  @Serialize(ConcertResponseDto)
  async getConcerts() {
    return await this.adminService.getConcerts();
  }

  @Post('create-concert')
  async createConcert(@Body() createConcertDto: CreateConcertDto) {
    return await this.adminService.createConcert(createConcertDto);
  }

  @Delete(':id')
  async deleteConcert(@Param('id') id: string) {
    return await this.adminService.deleteConcert(+id);
  }

  @Get('history')
  @Serialize(TransactionResponseDto)
  async getTransactions() {
    return await this.adminService.getTransactions();
  }

  @Get('totals')
  async getConcertTotals() {
    return await this.adminService.getConcertTotals();
  }
}
