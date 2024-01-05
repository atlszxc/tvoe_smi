import { Schema } from "mongoose"
import { clientDB } from "../../consts/dbClients"

export interface ICategory {
    _id?: Schema.Types.ObjectId,
    title: string,
    // isPublic?: boolean,
    // img?: string
}

export const clientCategorySchema = new Schema<ICategory>({
    title: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

export const clientCategoryModel = clientDB.model('category', clientCategorySchema)

//export const adminCategoryModel = model('category', adminCategotySchema)