import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class OfferCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  image:string;

  @Prop({ default: true })
  is_active: boolean;
}

export const offerCategorySchema = SchemaFactory.createForClass(OfferCategory);
