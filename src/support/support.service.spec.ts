import { Test, TestingModule } from '@nestjs/testing';
import { SupportService } from './support.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

describe('SupportService', () => {
  let service: SupportService;
  let prisma: PrismaService;
  let gateway: NotificationsGateway;

  const mockTransaction = {
    id: 'trans-id',
    donorName: 'Alice',
    amount: 5000,
    currency: 'XAF',
    transactionType: 'don_financier',
    status: 'en_attente',
  };

  const mockPrismaService = {
    transaction: {
      create: jest.fn().mockResolvedValue(mockTransaction),
    },
    volunteer: {
      create: jest.fn().mockResolvedValue({ id: 'vol-id', status: 'actif' }),
    },
    partner: {
      create: jest.fn().mockResolvedValue({ id: 'part-id', name: 'Partner Co' }),
    },
  };

  const mockNotificationsGateway = {
    notifyAdmins: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDonation', () => {
    it('should create a donation and notify admins', async () => {
      const dto = {
        donorName: 'Alice',
        amount: 5000,
        currency: 'XAF',
      };

      const result = await service.createDonation(dto);

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.create).toHaveBeenCalled();
      expect(mockNotificationsGateway.notifyAdmins).toHaveBeenCalledWith(
        'donation_received',
        expect.objectContaining({ donorName: 'Alice', amount: 5000 }),
      );
    });
  });

  describe('createVolunteer', () => {
    it('should register a new volunteer', async () => {
      const dto = {
        fullName: 'Bob Smith',
        skills: ['translation'],
      };

      const result = await service.createVolunteer(dto);
      expect(result.id).toBe('vol-id');
      expect(mockPrismaService.volunteer.create).toHaveBeenCalled();
    });
  });
});
