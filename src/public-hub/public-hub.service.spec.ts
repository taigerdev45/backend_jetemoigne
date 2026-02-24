import { Test, TestingModule } from '@nestjs/testing';
import { PublicHubService } from './public-hub.service';

describe('PublicHubService', () => {
  let service: PublicHubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicHubService],
    }).compile();

    service = module.get<PublicHubService>(PublicHubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
