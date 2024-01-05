import { Schema, model } from "mongoose"

export interface IAdvertising {
    title: string,
    img: string,
    companyUrl: string
}

const advertisingSchema = new Schema<IAdvertising>({
    title: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    companyUrl: {
        type: String,
        required: true
    }
})

export const advertisingModel = model('advertising', advertisingSchema)