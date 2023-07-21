import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Brand {
  @Prop()
  name: string;

  @Prop()
  image: string;

  @Prop({})
  url: string;

  @Prop({ default: false })
  is_deleted: boolean;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
