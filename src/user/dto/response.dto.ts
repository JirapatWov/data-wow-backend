import { Expose, Transform } from 'class-transformer';

export class ConcertResponseDto {
  @Expose()
  id: number;

  @Expose({ name: 'name' })
  name: string;

  @Expose({ name: 'detail' })
  detail: string;

  @Expose({ name: 'number_of_seats' })
  numberOfSeats: string;

  @Expose({ name: 'reserved' })
  reserved: string;

  @Expose()
  isReserved: boolean;

  @Expose({ name: 'created_at' })
  createdAt: boolean;
}

export class TransactionResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }) => (obj.concert ? obj.concert.name : null))
  concertName: string;

  @Expose({ name: 'action' })
  action: string;

  @Expose({ name: 'username' })
  username: string;

  @Expose({ name: 'created_at' })
  createdAt: boolean;
}
