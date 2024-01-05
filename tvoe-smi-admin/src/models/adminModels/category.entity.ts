import { Schema } from "mongoose"
import { adminDB } from "../../consts/dbClients"

export interface ICategory {
    title: string,
    isPublic?: boolean,
    img?: string
}

const adminCategotySchema = new Schema<ICategory>({
    title: {
        type: String,
        required: true,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    img: {
        type: String,
        default: null
    },
}, {
    timestamps: true
})

export const adminCategoryModel = adminDB.model('category', adminCategotySchema)