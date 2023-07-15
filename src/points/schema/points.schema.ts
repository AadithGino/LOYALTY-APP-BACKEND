import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Point {
  @Prop()
  user_id: string;

  @Prop()
  points: string;

  @Prop({ default: true })
  status: boolean;

  @Prop()
  redeemed_points: string
}

export const pointSchema = SchemaFactory.createForClass(Point);
