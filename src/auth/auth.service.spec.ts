import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, Profile } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockUser: Profile = {
    id: 'user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'admin',
  };

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn().mockResolvedValue(mockUser),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user profile if validation succeeds', async () => {
      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValueOnce(null);
      const result = await service.validateUser('notfound@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token and user info', () => {
      const result = service.login(mockUser);
      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result.user).toEqual(mockUser);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });
});
