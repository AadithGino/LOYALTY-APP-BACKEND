import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class NewOffer {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  image: string;
}

export const newOfferSchema = SchemaFactory.createForClass(NewOffer);
