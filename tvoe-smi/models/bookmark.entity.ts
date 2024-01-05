import { Schema, model } from "mongoose";
import { IPost } from "./post.entity";
import { IUser } from "./user.entity";

export interface IBookmark {
    user: IUser,
    post: IPost,
    isDeleted: boolean,
}

const bookmarkSchema = new Schema<IBookmark>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'post',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
})

export const bookmarkModel = model('bookmark', bookmarkSchema)