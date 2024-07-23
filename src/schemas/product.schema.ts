import { Prop, Schema, SchemaFactory } from '@Nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop()
  productName: string;

  @Prop({
    type: [String],
  })
  description: string[];

  @Prop()
  productCode: string;

  @Prop({
    type: {
      brand: String,
      series: String,
      line: String,
    },
  })
  modelType: {
    brand: string;
    series: string;
    line: string;
  };

  @Prop([{ key: String, value: String }])
  prices: { key: string; value: string }[];

  @Prop({ type: Types.ObjectId })
  imageId: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
