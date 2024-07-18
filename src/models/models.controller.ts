import {
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

  @Delete(':id')
  async deleteModel(@Param('id') id: string): Promise<Models> {
    return this.modelsService.deleteModel(id);
  }

  @Get('/api/models/check/:query')
  async checkModels(@Param('query') query: string): Promise<boolean> {
    if (await this.modelsService.findModelName(query)) {
      return true;
    }
    return false;
  }

  @Get('/api/models/summary')
  async getSummary(): Promise<any[]> {
    return this.modelsService.getSummary();
  }
}
