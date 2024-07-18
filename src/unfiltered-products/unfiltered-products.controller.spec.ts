import { Test, TestingModule } from '@nestjs/testing';
import { UnfilteredProductsController } from './unfiltered-products.controller';
import { UnfilteredProductsService } from './unfiltered-products.service';

describe('UnfilteredProductsController', () => {
  let controller: UnfilteredProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnfilteredProductsController],
      providers: [UnfilteredProductsService],
    }).compile();

    controller = module.get<UnfilteredProductsController>(UnfilteredProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
