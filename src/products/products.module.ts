import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from 'src/schemas/product.schema';
import { ModelSchema } from 'src/schemas/model.schema';
import { ModelsService } from 'src/models/models.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'products', schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: 'models', schema: ModelSchema }]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ModelsService],
})
export class ProductsModule {}
