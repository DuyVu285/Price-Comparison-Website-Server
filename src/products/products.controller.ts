import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from 'src/schemas/product.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from 'src/images/images.service';
import { ObjectId, Types } from 'mongoose';

@Controller()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imagesService: ImagesService,
  ) {}

  @Get('/api/products')
  async getAllProducts(): Promise<Product[]> {
    return this.productsService.getAllProducts();
  }

  @Get('/api/products/:id')
  async getProductById(@Param('id') id: string): Promise<Product> {
    return this.productsService.getProductById(id);
  }

  @Get('/api/category/:query')
  async getProductsByCategory(
    @Param('query') query: string,
  ): Promise<Product[]> {
    return this.productsService.getProductsByBrand(query);
  }

  @Get('/search/:query')
  async searchProducts(@Param('query') query: string): Promise<Product[]> {
    return this.productsService.searchProducts(query);
  }

  @Get('/searchSimilar/:id')
  async searchSimilarProducts(@Param('id') query: string): Promise<Product[]> {
    return this.productsService.searchSimilarProducts(query);
  }

  @Post('/api/products')
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Product> {

    let productData = JSON.parse(body.product);

    let imageId = await this.imagesService.uploadImage(image);

    console.log('Image id', imageId);

    productData.imageId = imageId;

    console.log('Check', productData);

    return this.productsService.createProduct(productData);
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

  @Get('/api/summary/products')
  async getSummary(): Promise<any> {
    return this.productsService.getSummary();
  }
}
