import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Models } from 'src/schemas/model.schema';
import { Model } from 'mongoose';
import * as natural from 'natural';
const tokenizer = new natural.WordTokenizer();
@Injectable()
export class ModelsService {
  constructor(
    @InjectModel('models') private readonly modelModel: Model<Models>,
  ) {}

  async getAllModels(): Promise<Models[]> {
    try {
      return await this.modelModel.find().exec();
    } catch (error) {
      throw new Error(`Unable to fetch models: ${error.message}`);
    }
  }

  async getModelById(modelId: string): Promise<Models> {
    try {
      const model = await this.modelModel.findById(modelId).exec();
      if (!model) {
        throw new NotFoundException(`Model with ID ${modelId} not found`);
      }
      return model;
    } catch (error) {
      throw new Error(`Unable to fetch model: ${error.message}`);
    }
  }

  async createModel(model: any): Promise<Models> {
    try {
      const createdModel = new this.modelModel(model);
      return await createdModel.save();
    } catch (error) {
      throw new BadRequestException(`Unable to create model: ${error.message}`);
    }
  }

  async updateModel(modelId: string, model: any): Promise<Models> {
    try {
      const updatedModel = await this.modelModel
        .findByIdAndUpdate(modelId, model, { new: true })
        .exec();
      if (!updatedModel) {
        throw new NotFoundException(`Model with ID ${modelId} not found`);
      }
      return updatedModel;
    } catch (error) {
      throw new Error(`Unable to update model: ${error.message}`);
    }
  }

  async deleteModel(modelId: string): Promise<Models> {
    try {
      const deletedModel = await this.modelModel
        .findByIdAndDelete(modelId)
        .exec();
      if (!deletedModel) {
        throw new NotFoundException(`Model with ID ${modelId} not found`);
      }
      return deletedModel;
    } catch (error) {
      throw new Error(`Unable to delete model: ${error.message}`);
    }
  }

  async findModelName(productName: string): Promise<{
    brand: string | null;
    series: string | null;
    line: string | null;
  }> {
    const documents = await this.modelModel.find().exec();

    const tokens = tokenizer.tokenize(productName.toLowerCase());

    for (const doc of documents) {
      const { brand, series, line } = doc.toObject();

      const brandTokens = tokenizer.tokenize(brand?.toLowerCase());
      const seriesTokens = tokenizer.tokenize(series?.toLowerCase());
      const lineTokens = tokenizer.tokenize(line?.toLowerCase());

      const brandMatch = brandTokens.every((token) => tokens.includes(token));
      const seriesMatch = seriesTokens.every((token) => tokens.includes(token));
      const lineMatch = lineTokens.every((token) => tokens.includes(token));

      if (brandMatch && seriesMatch && lineMatch) {
        const data = { brand, series, line };
        return data;
      } 
    }

    throw new NotFoundException('Model name not found');
  }

  async getSummary(): Promise<any> {
    try {
      const result = await this.modelModel.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);
      return result[0];
    } catch (error) {
      throw new Error(`Unable to fetch summary: ${error.message}`);
    }
  }
}
