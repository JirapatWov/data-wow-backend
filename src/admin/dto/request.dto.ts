import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Number Of Seat must be greater than 0' })
  numberOfSeats: number;
}
