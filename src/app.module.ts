import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelsModule } from './models/models.module';
import { UnfilteredProductsModule } from './unfiltered-products/unfiltered-products.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/PriceComparisonWebsite'),
    ProductsModule,
    ModelsModule,
    UnfilteredProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
