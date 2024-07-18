import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Product } from 'src/schemas/product.schema';
import { Model } from 'mongoose';
import { ModelsService } from 'src/models/models.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly modelsService: ModelsService,
    @InjectModel('products') private readonly productModel: Model<Product>,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productModel.find().exec();
    } catch (error) {
      throw new Error(`Unable to fetch products: ${error.message}`);
    }
  }

  async getProductById(productId: string): Promise<Product> {
    try {
      const product = await this.productModel.findById(productId).exec();
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
      return product;
    } catch (error) {
      throw new Error(`Unable to fetch product: ${error.message}`);
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const modelName = await this.modelsService.findModelName(query);
      const productCode = this.extractProductCode(query, modelName);

      return await this.productModel
        .find({ productName: { $regex: new RegExp(productCode, 'i') } })
        .exec();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          'No matching model found for the search query',
        );
      }
      throw new Error(`Unable to search products: ${error.message}`);
    }
  }

  async createProduct(product: any): Promise<Product> {
    try {
      const createdProduct = new this.productModel(product);
      return await createdProduct.save();
    } catch (error) {
      throw new BadRequestException(
        `Unable to create product: ${error.message}`,
      );
    }
  }

  async updateProduct(productId: string, product: any): Promise<Product> {
    try {
      const updatedProduct = await this.productModel
        .findByIdAndUpdate(productId, product, { new: true })
        .exec();
      if (!updatedProduct) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
      return updatedProduct;
    } catch (error) {
      throw new Error(`Unable to update product: ${error.message}`);
    }
  }

  async deleteProduct(productId: string): Promise<Product> {
    try {
      const deletedProduct = await this.productModel
        .findByIdAndDelete(productId)
        .exec();
      if (!deletedProduct) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
      return deletedProduct;
    } catch (error) {
      throw new Error(`Unable to delete product: ${error.message}`);
    }
  }

  async getSummary(): Promise<any> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const result = await this.productModel
        .aggregate([
          {
            $facet: {
              totalItems: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              itemsLast24Hours: [
                {
                  $match: {
                    createdAt: { $gte: yesterday },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
            },
          },
        ])
        .exec();
      return {
        totalItems: result[0].totalItems[0].count,
        itemsLast24Hours: result[0].itemsLast24Hours[0].count,
      };
    } catch (error) {
      throw new Error(`Unable to get summary: ${error.message}`);
    }
  }

  private extractProductCode(
    productName: string,
    modelName: {
      brand: string | null;
      series: string | null;
      line: string | null;
    },
  ): string {
    const keywordsToRemove = ['laptop', 'gaming'];
    for (const keyword of keywordsToRemove) {
      const keywordRegex = new RegExp(keyword, 'gi');
      productName = productName.replace(keywordRegex, '');
    }

    ['brand', 'series', 'line'].forEach((property) => {
      if (modelName[property]) {
        const propertyRegex = new RegExp(modelName[property], 'i');
        productName = productName.replace(propertyRegex, '');
      }
    });

    productName = productName.replace(/\s+/g, ' ').trim();
    return productName.replace(/-/g, ' ').trim();
  }
}
