import { Schema, model } from "mongoose";
import { IUser } from "./user.entity";

export interface IAuth {
    userId: IUser,
    token: string,
    refreshToken: string,
}

const authSchema = new Schema<IAuth>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

export const authModel = model('auth', authSchema)