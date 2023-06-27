import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Interest{
    @Prop()
    name: string;

    @Prop()
    categories:string[]
}

export const interestSchema = SchemaFactory.createForClass(Interest)