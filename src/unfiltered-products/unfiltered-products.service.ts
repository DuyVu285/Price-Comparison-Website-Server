import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnfilteredProduct } from 'src/schemas/unfiltered-product.schema';

@Injectable()
export class UnfilteredProductsService {
  constructor(
    @InjectModel('unfiltered-products')
    private readonly unfilteredProductModel: Model<UnfilteredProduct>,
  ) {}

  async getAllUnfilteredProducts(): Promise<UnfilteredProduct[]> {
    try {
      return await this.unfilteredProductModel.find();
    } catch (error) {
      console.error(`Unable to fetch unfiltered products: ${error.message}`);
    }
  }

  async getUnfilteredProductById(
    unfilteredProductId: string,
  ): Promise<UnfilteredProduct> {
    try {
      const product = await this.unfilteredProductModel
        .findById(unfilteredProductId)
        .exec();
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${unfilteredProductId} not found`,
        );
      }
      return product;
    } catch (error) {
      throw new Error(`Unable to fetch product: ${error.message}`);
    }
  }

  async deleteUnfilteredProduct(productId: string): Promise<UnfilteredProduct> {
    try {
      const deletedProduct = await this.unfilteredProductModel
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

  async deleteAllUnfilteredProducts(): Promise<void> {
    try {
      await this.unfilteredProductModel.deleteMany({});
    } catch (error) {
      throw new Error(`Unable to delete all products: ${error.message}`);
    }
  }

  async getSummary(): Promise<any> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const result = await this.unfilteredProductModel
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
        totalItems: result[0].totalItems[0]?.count || 0,
        itemsLast24Hours: result[0].itemsLast24Hours[0]?.count || 0,
      };
    } catch (error) {
      throw new Error(`Unable to fetch summary: ${error.message}`);
    }
  }
}
