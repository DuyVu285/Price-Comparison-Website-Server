import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from 'src/schemas/product.schema';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/api/products')
  async getAllProducts(): Promise<Product[]> {
    return this.productsService.getAllProducts();
  }

  @Get('/api/products/:id')
  async getProductById(@Param('id') id: string): Promise<Product> {
    return this.productsService.getProductById(id);
  }

  @Get('/search/:query')
  async searchProducts(@Param('query') query: string): Promise<Product[]> {
    return this.productsService.searchProducts(query);
  }

  @Post('/api/products')
  async createProduct(@Body() product: any): Promise<Product> {
    return this.productsService.createProduct(product);
  }

  @Patch('/api/products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() product: any,
  ): Promise<Product> {
    return this.productsService.updateProduct(id, product);
  }

  @Delete('/api/products/:id')
  async deleteProduct(@Param('id') id: string): Promise<Product> {
    return this.productsService.deleteProduct(id);
  }

  @Get('/api/products/summary')
  async getSummary(): Promise<any> {
    return this.productsService.getSummary();
  }
}
