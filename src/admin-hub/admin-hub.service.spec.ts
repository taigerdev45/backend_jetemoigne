import { Test, TestingModule } from '@nestjs/testing';
import { AdminHubService } from './admin-hub.service';

describe('AdminHubService', () => {
  let service: AdminHubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminHubService],
    }).compile();

    service = module.get<AdminHubService>(AdminHubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
