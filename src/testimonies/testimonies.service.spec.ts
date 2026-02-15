import { Test, TestingModule } from '@nestjs/testing';
import { TestimoniesService } from './testimonies.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

describe('TestimoniesService', () => {
  let service: TestimoniesService;
  let prisma: PrismaService;
  let gateway: NotificationsGateway;

  const mockTestimony = {
    id: 'test-id',
    authorName: 'Jean Doe',
    title: 'Mon Témoignage',
    status: 'recu',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    testimony: {
      create: jest.fn().mockResolvedValue(mockTestimony),
      findMany: jest.fn().mockResolvedValue([mockTestimony]),
      count: jest.fn().mockResolvedValue(1),
    },
  };

  const mockNotificationsGateway = {
    notifyAdmins: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestimoniesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
      ],
    }).compile();

    service = module.get<TestimoniesService>(TestimoniesService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a testimony and notify admins', async () => {
      const dto = {
        authorName: 'Jean Doe',
        title: 'Mon Témoignage',
        mediaType: 'ecrit',
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockTestimony);
      expect(mockPrismaService.testimony.create).toHaveBeenCalled();
      expect(mockNotificationsGateway.notifyAdmins).toHaveBeenCalledWith(
        'testimony_received',
        expect.objectContaining({ authorName: 'Jean Doe' }),
      );
    });
  });

  describe('findPublic', () => {
    it('should return paginated validated testimonies', async () => {
      const result = await service.findPublic({ page: 1, limit: 10 });

      expect(result.items).toEqual([mockTestimony]);
      expect(result.meta.total).toBe(1);
      expect(mockPrismaService.testimony.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'valide' } }),
      );
    });
  });
});
