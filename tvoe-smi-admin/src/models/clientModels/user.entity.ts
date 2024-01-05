import {Schema} from "mongoose";
import {clientDB} from "../../consts/dbClients";

export interface IUser {
    firstname: string,
    lastname: string,
    phone: string,
    isDeleted: boolean,
    isBanned: boolean,
    isBot: boolean,
    avatar?: string,
    createdAt: Date
}

const userSchema = new Schema<IUser>({
    avatar: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        default: 'Firstname User'
    },
    lastname: {
        type: String,
        default: 'Lastname User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    isBot: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

export const clientUserModel = clientDB.model('user', userSchema)