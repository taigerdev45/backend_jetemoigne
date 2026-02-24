import { Test, TestingModule } from '@nestjs/testing';
import { PublicHubController } from './public-hub.controller';

describe('PublicHubController', () => {
  let controller: PublicHubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicHubController],
    }).compile();

    controller = module.get<PublicHubController>(PublicHubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
