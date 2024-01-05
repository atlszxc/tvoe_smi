import { Schema } from "mongoose";
import { ICategory } from "./category.entity";
import { adminDB } from "../../consts/dbClients";

export interface ITag {
    title: string,
    category: ICategory,
}

const adminTagSchema = new Schema<ITag>({
    title: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true,
    }
}, {
    timestamps: true
})

export const adminTagModel = adminDB.model('tag', adminTagSchema)