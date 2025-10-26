import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CreateConcertDto } from './dto/request.dto';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    getConcerts: jest.fn(),
    createConcert: jest.fn(),
    deleteConcert: jest.fn(),
    getTransactions: jest.fn(),
    getConcertTotals: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
        {
          id: 2,
          name: 'Concert 2',
          detail: 'Detail 2',
          number_of_seats: 200,
          reserved: 100,
          created_at: new Date(),
        },
      ];

      mockAdminService.getConcerts.mockResolvedValue(mockConcerts);

      const result = await controller.getConcerts();

      expect(result).toEqual(mockConcerts);
      expect(service.getConcerts).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no concerts exist', async () => {
      mockAdminService.getConcerts.mockResolvedValue([]);

      const result = await controller.getConcerts();

      expect(result).toEqual([]);
      expect(service.getConcerts).toHaveBeenCalledTimes(1);
    });
  });

  describe('createConcert', () => {
    it('should create a concert successfully', async () => {
      const createConcertDto: CreateConcertDto = {
        name: 'New Concert',
        detail: 'Concert Details',
        numberOfSeats: 100,
      };

      const mockResponse = {
        message: 'Concert saved successfully.',
      };

      mockAdminService.createConcert.mockResolvedValue(mockResponse);

      const result = await controller.createConcert(createConcertDto);

      expect(result).toEqual(mockResponse);
      expect(service.createConcert).toHaveBeenCalledWith(createConcertDto);
      expect(service.createConcert).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteConcert', () => {
    it('should delete a concert by id', async () => {
      const concertId = '1';
      const mockDeleteResult = { affected: 1, raw: [] };

      mockAdminService.deleteConcert.mockResolvedValue(mockDeleteResult);

      const result = await controller.deleteConcert(concertId);

      expect(result).toEqual(mockDeleteResult);
      expect(service.deleteConcert).toHaveBeenCalledWith(1);
      expect(service.deleteConcert).toHaveBeenCalledTimes(1);
    });

    it('should handle string id conversion to number', async () => {
      const concertId = '123';
      const mockDeleteResult = { affected: 1, raw: [] };

      mockAdminService.deleteConcert.mockResolvedValue(mockDeleteResult);

      await controller.deleteConcert(concertId);

      expect(service.deleteConcert).toHaveBeenCalledWith(123);
    });
  });

  describe('getTransactions', () => {
    it('should return an array of transactions', async () => {
      const mockTransactions = [
        {
          id: 1,
          concert: { id: 1, name: 'Concert 1' },
          action: 'RESERVE',
          username: 'user1',
          created_at: new Date(),
        },
        {
          id: 2,
          concert: { id: 2, name: 'Concert 2' },
          action: 'CANCEL',
          username: 'user2',
          created_at: new Date(),
        },
      ];

      mockAdminService.getTransactions.mockResolvedValue(mockTransactions);

      const result = await controller.getTransactions();

      expect(result).toEqual(mockTransactions);
      expect(service.getTransactions).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no transactions exist', async () => {
      mockAdminService.getTransactions.mockResolvedValue([]);

      const result = await controller.getTransactions();

      expect(result).toEqual([]);
      expect(service.getTransactions).toHaveBeenCalledTimes(1);
    });
  });

  describe('getConcertTotals', () => {
    it('should return concert totals', async () => {
      const mockTotals = {
        totalSeats: 1000,
        totalReserved: 500,
        totalCancel: 50,
      };

      mockAdminService.getConcertTotals.mockResolvedValue(mockTotals);

      const result = await controller.getConcertTotals();

      expect(result).toEqual(mockTotals);
      expect(service.getConcertTotals).toHaveBeenCalledTimes(1);
    });

    it('should return zero values when no data exists', async () => {
      const mockTotals = {
        totalSeats: 0,
        totalReserved: 0,
        totalCancel: 0,
      };

      mockAdminService.getConcertTotals.mockResolvedValue(mockTotals);

      const result = await controller.getConcertTotals();

      expect(result).toEqual(mockTotals);
    });
  });
});
