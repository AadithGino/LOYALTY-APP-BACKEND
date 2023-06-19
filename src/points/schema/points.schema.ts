import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

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
    points:string;
}

export const pointSchema = SchemaFactory.createForClass(Point)