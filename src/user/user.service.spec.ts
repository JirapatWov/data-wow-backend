import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Concert } from '../entities/concert.entity';
import { Transaction, TransactionAction } from '../entities/transaction.entity';
import { ReserveDto, CancelDto, GetMyConcertQueryDto } from './dto/request.dto';

describe('UserService', () => {
  let service: UserService;
  let concertRepository: Repository<Concert>;
  let transactionRepository: Repository<Transaction>;

  const mockConcertRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTransactionRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Concert),
          useValue: mockConcertRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    concertRepository = module.get<Repository<Concert>>(
      getRepositoryToken(Concert),
    );
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConcerts', () => {
    it('should return concerts with isReserved status', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          number_of_seats: 100,
          reserved: 50,
          created_at: new Date(),
        },
      ];

      const mockRaw = [
        {
          last_action: TransactionAction.RESERVE,
        },
      ];

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: mockRaw, entities: mockConcerts }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getConcerts();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(concertRepository.createQueryBuilder).toHaveBeenCalledWith(
        'concert',
      );
    });

    it('should set isReserved to true when last action is RESERVE', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          number_of_seats: 100,
          reserved: 50,
          created_at: new Date(),
        },
      ];

      const mockRaw = [
        {
          last_action: TransactionAction.RESERVE,
        },
      ];

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: mockRaw, entities: mockConcerts }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getConcerts();

      expect(result[0]).toHaveProperty('isReserved');
    });

    it('should set isReserved to false when last action is CANCEL', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          number_of_seats: 100,
          reserved: 50,
          created_at: new Date(),
        },
      ];

      const mockRaw = [
        {
          last_action: TransactionAction.CANCEL,
        },
      ];

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: mockRaw, entities: mockConcerts }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getConcerts();

      expect(result[0]).toHaveProperty('isReserved');
    });

    it('should set isReserved to false when last action is null', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          number_of_seats: 100,
          reserved: 50,
          created_at: new Date(),
        },
      ];

      const mockRaw = [
        {
          last_action: null,
        },
      ];

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: mockRaw, entities: mockConcerts }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getConcerts();

      expect(result[0]).toHaveProperty('isReserved');
    });

    it('should return empty array when no concerts exist', async () => {
      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: [], entities: [] }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getConcerts();

      expect(result).toEqual([]);
    });
  });

  describe('reserveConcert', () => {
    const reserveDto: ReserveDto = {
      concertId: 1,
    };

    it('should reserve a concert successfully', async () => {
      const mockConcert = {
        id: 1,
        name: 'Concert 1',
        detail: 'Detail 1',
        number_of_seats: 100,
        reserved: 50,
      };

      mockConcertRepository.findOne.mockResolvedValue(mockConcert);
      mockTransactionRepository.save.mockResolvedValue({});

      const result = await service.reserveConcert(reserveDto);

      expect(result).toEqual({
        message: 'reserve successfully.',
      });
      expect(concertRepository.findOne).toHaveBeenCalledWith({
        where: { id: reserveDto.concertId },
      });
      expect(transactionRepository.save).toHaveBeenCalled();
    });

    it('should create transaction with correct action', async () => {
      const mockConcert = {
        id: 1,
        name: 'Concert 1',
        detail: 'Detail 1',
        number_of_seats: 100,
        reserved: 50,
      };

      mockConcertRepository.findOne.mockResolvedValue(mockConcert);
      mockTransactionRepository.save.mockResolvedValue({});

      await service.reserveConcert(reserveDto);

      const savedTransaction = mockTransactionRepository.save.mock.calls[0][0];
      expect(savedTransaction.action).toBe(TransactionAction.RESERVE);
      expect(savedTransaction.concert).toEqual(mockConcert);
      expect(savedTransaction.username).toBe('testuser');
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockConcertRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.reserveConcert(reserveDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.reserveConcert(reserveDto)).rejects.toThrow(
        'Unexpected error occurred',
      );
    });

    it('should rethrow BadRequestException', async () => {
      mockConcertRepository.findOne.mockRejectedValue(
        new BadRequestException('Bad request'),
      );

      await expect(service.reserveConcert(reserveDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rethrow ConflictException', async () => {
      mockConcertRepository.findOne.mockRejectedValue(
        new ConflictException('Conflict'),
      );

      await expect(service.reserveConcert(reserveDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('cencelConcert', () => {
    const cancelDto: CancelDto = {
      concertId: 1,
    };

    it('should cancel a concert successfully', async () => {
      const mockConcert = {
        id: 1,
        name: 'Concert 1',
        detail: 'Detail 1',
        number_of_seats: 100,
        reserved: 50,
      };

      mockConcertRepository.findOne.mockResolvedValue(mockConcert);
      mockTransactionRepository.save.mockResolvedValue({});

      const result = await service.cencelConcert(cancelDto);

      expect(result).toEqual({
        message: 'cancel successfully.',
      });
      expect(concertRepository.findOne).toHaveBeenCalledWith({
        where: { id: cancelDto.concertId },
      });
      expect(transactionRepository.save).toHaveBeenCalled();
    });

    it('should create transaction with correct action', async () => {
      const mockConcert = {
        id: 1,
        name: 'Concert 1',
        detail: 'Detail 1',
        number_of_seats: 100,
        reserved: 50,
      };

      mockConcertRepository.findOne.mockResolvedValue(mockConcert);
      mockTransactionRepository.save.mockResolvedValue({});

      await service.cencelConcert(cancelDto);

      const savedTransaction = mockTransactionRepository.save.mock.calls[0][0];
      expect(savedTransaction.action).toBe(TransactionAction.CANCEL);
      expect(savedTransaction.concert).toEqual(mockConcert);
      expect(savedTransaction.username).toBe('testuser');
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockConcertRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.cencelConcert(cancelDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.cencelConcert(cancelDto)).rejects.toThrow(
        'Unexpected error occurred',
      );
    });

    it('should rethrow BadRequestException', async () => {
      mockConcertRepository.findOne.mockRejectedValue(
        new BadRequestException('Bad request'),
      );

      await expect(service.cencelConcert(cancelDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rethrow ConflictException', async () => {
      mockConcertRepository.findOne.mockRejectedValue(
        new ConflictException('Conflict'),
      );

      await expect(service.cencelConcert(cancelDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getMyConcerts', () => {
    const query: GetMyConcertQueryDto = {
      username: 'testuser',
    };

    it('should return user reserved concerts', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          number_of_seats: 100,
          reserved: 50,
          created_at: new Date(),
        },
      ];

      const mockRaw = [
        {
          last_action: TransactionAction.RESERVE,
        },
      ];

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: mockRaw, entities: mockConcerts }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getMyConcerts(query);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(concertRepository.createQueryBuilder).toHaveBeenCalledWith(
        'concert',
      );
    });

    it('should filter concerts by username', async () => {
      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: [], entities: [] }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await service.getMyConcerts(query);

      expect(mockQueryBuilder.having).toHaveBeenCalledWith(
        'last_action = :reserve',
        {
          reserve: TransactionAction.RESERVE,
        },
      );
    });

    it('should set isReserved to true for all returned concerts', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          number_of_seats: 100,
          reserved: 50,
          created_at: new Date(),
        },
        {
          id: 2,
          name: 'Concert 2',
          detail: 'Detail 2',
          number_of_seats: 200,
          reserved: 100,
          created_at: new Date(),
        },
      ];

      const mockRaw = [
        { last_action: TransactionAction.RESERVE },
        { last_action: TransactionAction.RESERVE },
      ];

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: mockRaw, entities: mockConcerts }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getMyConcerts(query);

      result.forEach((concert) => {
        expect(concert).toHaveProperty('isReserved');
      });
    });

    it('should return empty array when user has no reserved concerts', async () => {
      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: [], entities: [] }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getMyConcerts(query);

      expect(result).toEqual([]);
    });

    it('should group concerts by id', async () => {
      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockResolvedValue({ raw: [], entities: [] }),
      } as unknown as SelectQueryBuilder<Concert>;

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await service.getMyConcerts(query);

      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('concert.id');
    });
  });
});
