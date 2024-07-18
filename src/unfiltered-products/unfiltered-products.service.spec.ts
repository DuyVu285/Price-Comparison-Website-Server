import { Test, TestingModule } from '@nestjs/testing';
import { UnfilteredProductsService } from './unfiltered-products.service';

describe('UnfilteredProductsService', () => {
  let service: UnfilteredProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnfilteredProductsService],
    }).compile();

    service = module.get<UnfilteredProductsService>(UnfilteredProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
