import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ReserveDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'concert id must be greater than 0' })
  concertId: number;
}

export class CancelDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'concert id must be greater than 0' })
  concertId: number;
}

export class GetMyConcertQueryDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
