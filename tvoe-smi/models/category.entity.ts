import { Schema, model } from "mongoose"

export interface ICategory {
    title: string
}

const categorySchema = new Schema<ICategory>({
    title: {
        type: String,
        required: true,
    }
})

export const categoryModel = model('category', categorySchema)