import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { UserService } from './user.service';
import { CancelDto, GetMyConcertQueryDto, ReserveDto } from './dto/request.dto';
import { ConcertResponseDto, TransactionResponseDto } from './dto/response.dto';
import { AdminService } from 'src/admin/admin.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('concerts')
  @Serialize(ConcertResponseDto)
  async getConcerts() {
    return await this.userService.getConcerts();
  }

  @Post('reserve')
  async reserveConcert(@Body() reservetDto: ReserveDto) {
    return await this.userService.reserveConcert(reservetDto);
  }

  @Post('cancel')
  async cencelConcert(@Body() canceltDto: CancelDto) {
    return await this.userService.cencelConcert(canceltDto);
  }

  @Get('my-concert')
  @Serialize(ConcertResponseDto)
  async getMyConcerts(@Query() query: GetMyConcertQueryDto) {
    return await this.userService.getMyConcerts(query);
  }
}
