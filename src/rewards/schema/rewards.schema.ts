import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Reward {
  @Prop()
  name: string;

  @Prop()
  points_on_completion: number;

  @Prop({ default: true })
  status: boolean;
}

export const rewardSchema = SchemaFactory.createForClass(Reward);