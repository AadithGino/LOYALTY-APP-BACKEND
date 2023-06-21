import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface benefits {
  maxDiscount: number;
  moneyToBeSpend: number;
  pointValue: number;
}

export interface cretieria {
  minPointsForTier: number;
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Tier {
  @Prop({ enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], unique: true })
  name: string;

  @Prop({ type: Object })
  benefits: {};

  @Prop({ type: Object })
  cretieria: {};

  @Prop()
  points_accumalated: number;

  @Prop()
  total_spends: number;

  @Prop({ default: true })
  status: boolean;
}

export const tierSchema = SchemaFactory.createForClass(Tier);
