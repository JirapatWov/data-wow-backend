import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ReserveDto, CancelDto, GetMyConcertQueryDto } from './dto/request.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    getConcerts: jest.fn(),
    reserveConcert: jest.fn(),
    cencelConcert: jest.fn(),
    getMyConcerts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConcerts', () => {
    it('should return an array of concerts with reservation status', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          numberOfSeats: 100,
          reserved: 50,
          isReserved: true,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: 'Concert 2',
          detail: 'Detail 2',
          numberOfSeats: 200,
          reserved: 100,
          isReserved: false,
          createdAt: new Date(),
        },
      ];

      mockUserService.getConcerts.mockResolvedValue(mockConcerts);

      const result = await controller.getConcerts();

      expect(result).toEqual(mockConcerts);
      expect(service.getConcerts).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no concerts exist', async () => {
      mockUserService.getConcerts.mockResolvedValue([]);

      const result = await controller.getConcerts();

      expect(result).toEqual([]);
      expect(service.getConcerts).toHaveBeenCalledTimes(1);
    });

    it('should include isReserved property in concert data', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          numberOfSeats: 100,
          reserved: 50,
          isReserved: true,
          createdAt: new Date(),
        },
      ];

      mockUserService.getConcerts.mockResolvedValue(mockConcerts);

      const result = await controller.getConcerts();

      expect(result[0]).toHaveProperty('isReserved');
      expect(result[0].isReserved).toBe(true);
    });
  });

  describe('reserveConcert', () => {
    it('should reserve a concert successfully', async () => {
      const reserveDto: ReserveDto = {
        concertId: 1,
      };

      const mockResponse = {
        message: 'reserve successfully.',
      };

      mockUserService.reserveConcert.mockResolvedValue(mockResponse);

      const result = await controller.reserveConcert(reserveDto);

      expect(result).toEqual(mockResponse);
      expect(service.reserveConcert).toHaveBeenCalledWith(reserveDto);
      expect(service.reserveConcert).toHaveBeenCalledTimes(1);
    });

    it('should call service with correct concert id', async () => {
      const reserveDto: ReserveDto = {
        concertId: 123,
      };

      mockUserService.reserveConcert.mockResolvedValue({
        message: 'reserve successfully.',
      });

      await controller.reserveConcert(reserveDto);

      expect(service.reserveConcert).toHaveBeenCalledWith(
        expect.objectContaining({
          concertId: 123,
        }),
      );
    });
  });

  describe('cencelConcert', () => {
    it('should cancel a concert successfully', async () => {
      const cancelDto: CancelDto = {
        concertId: 1,
      };

      const mockResponse = {
        message: 'cancel successfully.',
      };

      mockUserService.cencelConcert.mockResolvedValue(mockResponse);

      const result = await controller.cencelConcert(cancelDto);

      expect(result).toEqual(mockResponse);
      expect(service.cencelConcert).toHaveBeenCalledWith(cancelDto);
      expect(service.cencelConcert).toHaveBeenCalledTimes(1);
    });

    it('should call service with correct concert id', async () => {
      const cancelDto: CancelDto = {
        concertId: 456,
      };

      mockUserService.cencelConcert.mockResolvedValue({
        message: 'cancel successfully.',
      });

      await controller.cencelConcert(cancelDto);

      expect(service.cencelConcert).toHaveBeenCalledWith(
        expect.objectContaining({
          concertId: 456,
        }),
      );
    });
  });

  describe('getMyConcerts', () => {
    it('should return user reserved concerts', async () => {
      const query: GetMyConcertQueryDto = {
        username: 'testuser',
      };

      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          numberOfSeats: 100,
          reserved: 50,
          isReserved: true,
          createdAt: new Date(),
        },
      ];

      mockUserService.getMyConcerts.mockResolvedValue(mockConcerts);

      const result = await controller.getMyConcerts(query);

      expect(result).toEqual(mockConcerts);
      expect(service.getMyConcerts).toHaveBeenCalledWith(query);
      expect(service.getMyConcerts).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no reserved concerts', async () => {
      const query: GetMyConcertQueryDto = {
        username: 'testuser',
      };

      mockUserService.getMyConcerts.mockResolvedValue([]);

      const result = await controller.getMyConcerts(query);

      expect(result).toEqual([]);
      expect(service.getMyConcerts).toHaveBeenCalledTimes(1);
    });

    it('should call service with correct username', async () => {
      const query: GetMyConcertQueryDto = {
        username: 'johndoe',
      };

      mockUserService.getMyConcerts.mockResolvedValue([]);

      await controller.getMyConcerts(query);

      expect(service.getMyConcerts).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'johndoe',
        }),
      );
    });

    it('should return only concerts with isReserved true', async () => {
      const query: GetMyConcertQueryDto = {
        username: 'testuser',
      };

      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          detail: 'Detail 1',
          numberOfSeats: 100,
          reserved: 50,
          isReserved: true,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: 'Concert 2',
          detail: 'Detail 2',
          numberOfSeats: 200,
          reserved: 100,
          isReserved: true,
          createdAt: new Date(),
        },
      ];

      mockUserService.getMyConcerts.mockResolvedValue(mockConcerts);

      const result = await controller.getMyConcerts(query);

      expect(result.every((concert) => concert.isReserved === true)).toBe(true);
    });
  });
});
