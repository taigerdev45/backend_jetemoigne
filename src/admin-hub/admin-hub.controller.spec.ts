import { Test, TestingModule } from '@nestjs/testing';
import { AdminHubController } from './admin-hub.controller';

describe('AdminHubController', () => {
  let controller: AdminHubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminHubController],
    }).compile();

    controller = module.get<AdminHubController>(AdminHubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
