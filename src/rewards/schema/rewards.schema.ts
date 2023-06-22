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
  points_required: number;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: false })
  isDeleted:boolean

  @Prop()
  description: string
}

export const rewardSchema = SchemaFactory.createForClass(Reward);
