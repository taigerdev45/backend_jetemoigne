import { Test, TestingModule } from '@nestjs/testing';
import { TestimoniesController } from './testimonies.controller';

describe('TestimoniesController', () => {
  let controller: TestimoniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestimoniesController],
    }).compile();

    controller = module.get<TestimoniesController>(TestimoniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
