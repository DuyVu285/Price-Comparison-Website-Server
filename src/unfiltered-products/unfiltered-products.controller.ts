import { Controller, Get, Param, Delete } from '@nestjs/common';
import { UnfilteredProductsService } from './unfiltered-products.service';
import { UnfilteredProduct } from 'src/schemas/unfiltered-product.schema';

@Controller()
export class UnfilteredProductsController {
  constructor(
    private readonly unfilteredProductsService: UnfilteredProductsService,
  ) {}

  @Get('/api/unfiltered-products')
  async getAllProducts(): Promise<UnfilteredProduct[]> {
    return this.unfilteredProductsService.getAllUnfilteredProducts();
  }

  @Get('/api/unfiltered-products/:id')
  async getUnfilteredProductById(
    @Param('id') id: string,
  ): Promise<UnfilteredProduct> {
    return this.unfilteredProductsService.getUnfilteredProductById(id);
  }

  @Delete('/api/unfiltered-products/:id')
  async deleteUnfilteredProduct(
    @Param('id') id: string,
  ): Promise<UnfilteredProduct> {
    return this.unfilteredProductsService.deleteUnfilteredProduct(id);
  }

  @Delete('/api/unfiltered-products')
  async deleteAllUnfilteredProducts(): Promise<void> {
    return this.unfilteredProductsService.deleteAllUnfilteredProducts();
  }

  @Get('/api/unfiltered-products/summary')
  async getSummary(): Promise<any> {
    return this.unfilteredProductsService.getSummary();
  }
}
