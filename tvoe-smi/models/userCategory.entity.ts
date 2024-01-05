import { Schema, model } from "mongoose";
import { ICategory } from "./category.entity";
import { IUser } from "./user.entity";

export interface IUserCategory {
    user: IUser,
    categories: ICategory[]
}

const userCategorySchema = new Schema<IUserCategory>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    categories: [{ type: Schema.Types.ObjectId, ref: 'category' }]
})

export const userCategoryModel = model('userCategory', userCategorySchema)