import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Concert } from 'src/entities/concert.entity';
import {
  Transaction,
  TransactionAction,
} from 'src/entities/transaction.entity';
import { CreateConcertDto } from './dto/request.dto';

describe('AdminService', () => {
  let service: AdminService;
  let concertRepository: Repository<Concert>;
  let transactionRepository: Repository<Transaction>;

  const mockConcertRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
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

    service = module.get<AdminService>(AdminService);
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
    it('should return an array of concerts', async () => {
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

      mockConcertRepository.find.mockResolvedValue(mockConcerts);

      const result = await service.getConcerts();

      expect(result).toEqual(mockConcerts);
      expect(concertRepository.find).toHaveBeenCalledWith({});
    });

    it('should return an empty array when no concerts exist', async () => {
      mockConcertRepository.find.mockResolvedValue([]);

      const result = await service.getConcerts();

      expect(result).toEqual([]);
    });
  });

  describe('createConcert', () => {
    const createConcertDto: CreateConcertDto = {
      name: 'New Concert',
      detail: 'Concert Details',
      numberOfSeats: 100,
    };

    it('should create a concert successfully', async () => {
      mockConcertRepository.findOne.mockResolvedValue(null);
      mockConcertRepository.save.mockResolvedValue({
        id: 1,
        ...createConcertDto,
        number_of_seats: createConcertDto.numberOfSeats,
        reserved: 0,
      });

      const result = await service.createConcert(createConcertDto);

      expect(result).toEqual({
        message: 'Concert saved successfully.',
      });
      expect(concertRepository.findOne).toHaveBeenCalledWith({
        where: [{ name: createConcertDto.name }],
      });
      expect(concertRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when concert already exists', async () => {
      const existingConcert = {
        id: 1,
        name: 'New Concert',
        detail: 'Detail',
        number_of_seats: 100,
        reserved: 0,
      };

      mockConcertRepository.findOne.mockResolvedValue(existingConcert);

      await expect(service.createConcert(createConcertDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createConcert(createConcertDto)).rejects.toThrow(
        'Concert already exists',
      );
      expect(concertRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockConcertRepository.findOne.mockResolvedValue(null);
      mockConcertRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createConcert(createConcertDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.createConcert(createConcertDto)).rejects.toThrow(
        'Unexpected error occurred',
      );
    });

    it('should rethrow BadRequestException', async () => {
      mockConcertRepository.findOne.mockRejectedValue(
        new BadRequestException('Bad request'),
      );

      await expect(service.createConcert(createConcertDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should set reserved to 0 when creating concert', async () => {
      mockConcertRepository.findOne.mockResolvedValue(null);
      const saveSpy = mockConcertRepository.save.mockResolvedValue({});

      await service.createConcert(createConcertDto);

      const savedConcert = saveSpy.mock.calls[0][0];
      expect(savedConcert.reserved).toBe(0);
      expect(savedConcert.name).toBe(createConcertDto.name);
      expect(savedConcert.detail).toBe(createConcertDto.detail);
      expect(savedConcert.number_of_seats).toBe(createConcertDto.numberOfSeats);
    });
  });

  describe('deleteConcert', () => {
    it('should delete a concert by id', async () => {
      const concertId = 1;
      const mockDeleteResult = { affected: 1, raw: [] };

      mockConcertRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.deleteConcert(concertId);

      expect(result).toEqual(mockDeleteResult);
      expect(concertRepository.delete).toHaveBeenCalledWith({ id: concertId });
    });

    it('should return affected: 0 when concert does not exist', async () => {
      const concertId = 999;
      const mockDeleteResult = { affected: 0, raw: [] };

      mockConcertRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.deleteConcert(concertId);

      expect(result).toEqual(mockDeleteResult);
      expect(result.affected).toBe(0);
    });
  });

  describe('getTransactions', () => {
    it('should return an array of transactions with concert relations', async () => {
      const mockTransactions = [
        {
          id: 1,
          concert: {
            id: 1,
            name: 'Concert 1',
          },
          action: TransactionAction.RESERVE,
          username: 'user1',
          created_at: new Date(),
        },
      ];

      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getTransactions();

      expect(result).toEqual(mockTransactions);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        relations: { concert: true },
      });
    });

    it('should return an empty array when no transactions exist', async () => {
      mockTransactionRepository.find.mockResolvedValue([]);

      const result = await service.getTransactions();

      expect(result).toEqual([]);
    });
  });

  describe('getConcertTotals', () => {
    it('should return correct totals', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockTransactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      // First call for seats
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '1000' });
      // Second call for reserved
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '500' });
      // Third call for cancel
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '50' });

      const result = await service.getConcertTotals();

      expect(result).toEqual({
        totalSeats: 1000,
        totalReserved: 500,
        totalCancel: 50,
      });
    });

    it('should return zero values when totals are null', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockTransactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      const result = await service.getConcertTotals();

      expect(result).toEqual({
        totalSeats: 0,
        totalReserved: 0,
        totalCancel: 0,
      });
    });

    it('should handle undefined totals', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      mockConcertRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockTransactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      mockQueryBuilder.getRawOne.mockResolvedValue({ total: undefined });

      const result = await service.getConcertTotals();

      expect(result).toEqual({
        totalSeats: 0,
        totalReserved: 0,
        totalCancel: 0,
      });
    });

    it('should call query builders with correct parameters', async () => {
      const mockConcertQB = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '100' }),
      };

      const mockReserveQB = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '50' }),
      };

      const mockCancelQB = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '10' }),
      };

      mockConcertRepository.createQueryBuilder.mockReturnValue(mockConcertQB);
      mockTransactionRepository.createQueryBuilder
        .mockReturnValueOnce(mockReserveQB)
        .mockReturnValueOnce(mockCancelQB);

      await service.getConcertTotals();

      expect(mockConcertRepository.createQueryBuilder).toHaveBeenCalledWith(
        'c',
      );
      expect(mockConcertQB.select).toHaveBeenCalledWith(
        'COALESCE(SUM(c.number_of_seats), 0)',
        'total',
      );

      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalledWith(
        't',
      );
      expect(mockReserveQB.where).toHaveBeenCalledWith('t.action = :action', {
        action: TransactionAction.RESERVE,
      });
      expect(mockCancelQB.where).toHaveBeenCalledWith('t.action = :action', {
        action: TransactionAction.CANCEL,
      });
    });
  });
});
