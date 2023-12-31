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
  points_on_completetion: number;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: false })
  is_deleted:boolean

  @Prop()
  description: string
}

export const rewardSchema = SchemaFactory.createForClass(Reward);
