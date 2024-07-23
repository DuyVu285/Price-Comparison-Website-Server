import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Product } from 'src/schemas/product.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
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

  async getProductsByBrand(brand: string): Promise<Product[]> {
    try {
      return await this.productModel.find({ 'modelType.brand': brand }).exec();
    } catch (error) {
      throw new Error(`Unable to fetch products: ${error.message}`);
    }
  }

  async searchProducts(query: string): Promise<any[]> {
    try {
      const normalizedQuery = query.toLowerCase().trim();

      const fullTextResults = await this.productModel
        .find({ $text: { $search: normalizedQuery } })
        .exec();

      const regexPattern = new RegExp(
        `.*${normalizedQuery.split(' ').join('.*')}.*`,
        'i',
      );
      const regexResults = await this.productModel
        .find({ productName: { $regex: regexPattern } })
        .exec();

      const combinedResults = [...fullTextResults, ...regexResults];
      const uniqueResultsMap = new Map<string, any>();
      combinedResults.forEach((product) => {
        if (!uniqueResultsMap.has(product._id.toString())) {
          uniqueResultsMap.set(product._id.toString(), product);
        }
      });

      const uniqueResults = Array.from(uniqueResultsMap.values());

      const scoredResults = uniqueResults.map((product) => {
        const score = this.calculateRelevanceScore(
          product.productName,
          normalizedQuery,
        );
        return { ...product.toObject(), score };
      });

      scoredResults.sort((a, b) => b.score - a.score);

      return scoredResults.slice(0, 10);
    } catch (error) {
      throw new Error(`Unable to search products: ${error.message}`);
    }
  }

  async searchSimilarProducts(query: string): Promise<any[]> {
    try {
      const normalizedQuery = query.toLowerCase().trim();

      const fullTextResults = await this.productModel
        .find({ $text: { $search: normalizedQuery } })
        .exec();

      const regexPattern = new RegExp(
        `.*${normalizedQuery.split(' ').join('.*')}.*`,
        'i',
      );
      const regexResults = await this.productModel
        .find({ productName: { $regex: regexPattern } })
        .exec();

      const combinedResults = [...fullTextResults, ...regexResults];

      const uniqueResultsMap = new Map<string, any>();
      combinedResults.forEach((product) => {
        if (!uniqueResultsMap.has(product._id.toString())) {
          uniqueResultsMap.set(product._id.toString(), product);
        }
      });

      const uniqueResults = Array.from(uniqueResultsMap.values());

      const scoredResults = uniqueResults.map((product) => {
        const score = this.calculateRelevanceScore(
          product.productName,
          normalizedQuery,
        );
        return { ...product.toObject(), score };
      });

      const maxScore = Math.max(
        ...scoredResults.map((product) => product.score),
      );

      const filteredResults = scoredResults.filter(
        (product) => product.score !== maxScore,
      );

      filteredResults.sort((a, b) => b.score - a.score);

      return filteredResults.slice(0, 4);
    } catch (error) {
      throw new Error(`Unable to search products: ${error.message}`);
    }
  }

  private calculateRelevanceScore(productName: string, query: string): number {
    const terms = query.split(' ');
    let score = 0;

    terms.forEach((term) => {
      if (productName.toLowerCase().includes(term)) {
        score += 1;
      }
    });

    return score;
  }

  async createProduct(product: any): Promise<Product> {
    try {
      const existingProduct = await this.productModel.findOne({
        name: product.productName,
      });

      if (existingProduct) {
        throw new BadRequestException('Product with this name already exists');
      }
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

      // Safeguard to prevent accessing properties of undefined
      const totalItemsCount = result[0]?.totalItems[0]?.count || 0;
      const itemsLast24HoursCount = result[0]?.itemsLast24Hours[0]?.count || 0;

      return {
        totalItems: totalItemsCount,
        itemsLast24Hours: itemsLast24HoursCount,
      };
    } catch (error) {
      throw new Error(`Unable to get summary: ${error.message}`);
    }
  }
}
