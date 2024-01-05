import { Schema, model } from "mongoose";
import { IUser } from "./user.entity";

export enum AuthType {
    SIGNUP,
    SIGNIN,
}

export interface IAuthLog {
    user: IUser
    type: AuthType
}

const authLogSchema = new Schema<IAuthLog>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: Number,
        enum: AuthType
    }
}, { timestamps: true })

export const authLogModel = model('authLog', authLogSchema)