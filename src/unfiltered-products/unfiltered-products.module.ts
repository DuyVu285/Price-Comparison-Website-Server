import { Module } from '@nestjs/common';
import { UnfilteredProductsService } from './unfiltered-products.service';
import { UnfilteredProductsController } from './unfiltered-products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UnfilteredProductSchema } from 'src/schemas/unfiltered-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'unfiltered-products', schema: UnfilteredProductSchema },
    ]),
  ],
  controllers: [UnfilteredProductsController],
  providers: [UnfilteredProductsService],
})
export class UnfilteredProductsModule {}
