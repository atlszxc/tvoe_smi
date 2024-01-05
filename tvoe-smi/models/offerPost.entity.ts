import { Schema, model } from "mongoose"

export interface IPostOffer {
    firstname: string,
    email: string,
    postDescription: string
}

const postOfferSchema = new Schema<IPostOffer>({
    firstname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    postDescription: {
        type: String,
        required: true
    }
})

export const postOfferModel = model('postOffer', postOfferSchema)