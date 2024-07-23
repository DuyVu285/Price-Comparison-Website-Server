import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ModelsService } from './models.service';
import { Models } from 'src/schemas/model.schema';

@Controller()
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get('/api/models')
  async getAllModels(): Promise<Models[]> {
    return this.modelsService.getAllModels();
  }

  @Get('/api/models/:id')
  async getModelById(@Param('id') id: string): Promise<Models> {
    return this.modelsService.getModelById(id);
  }

  @Post('/api/models')
  async createMoel(@Body() model: any): Promise<Models> {
    return this.modelsService.createModel(model);
  }

  @Patch('/api/models/:id')
  async updateModel(
    @Param('id') id: string,
    @Body() model: any,
  ): Promise<Models> {
    return this.modelsService.updateModel(id, model);
  }

  @Delete('/api/models/:id')
  async deleteModel(@Param('id') id: string): Promise<Models> {
    return this.modelsService.deleteModel(id);
  }

  @Post('/api/models/check')
  async checkModels(@Body() body: any): Promise<{ [key: string]: boolean }> {
    if (
      !Array.isArray(body.productNames) ||
      !body.productNames.every((name: any) => typeof name === 'string')
    ) {
      throw new BadRequestException('productNames must be an array of strings');
    }

    const productNames = body.productNames;
    const results = await Promise.all(
      productNames.map(async (productName) => {
        const result = await this.modelsService.findModelName(productName);
        return { [productName]: !!result.brand && !!result.series };
      }),
    );

    return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }

  @Get('/api/summary/models')
  async getSummary(): Promise<any[]> {
    return this.modelsService.getSummary();
  }
}
