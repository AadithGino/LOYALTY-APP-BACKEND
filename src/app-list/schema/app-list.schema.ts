import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class AppList {
  @Prop()
  name: string;

  @Prop()
  image: string;

  @Prop({ default: 2 })
  status: number;
}

export const AppListSchema = SchemaFactory.createForClass(AppList);
