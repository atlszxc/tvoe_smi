import { Schema, model } from "mongoose";
import { ICategory } from "./category.entity";

export interface ITag {
    title: string,
    category: ICategory
}

const tagSchema = new Schema<ITag>({
    title: {
        type: String,
        required: true
    },
    
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    }
})

export const tagModel = model('tag', tagSchema)