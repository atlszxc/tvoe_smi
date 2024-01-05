import { Schema, model } from "mongoose";
import { IPost } from "./post.entity";
import { IUser } from "./user.entity";

export interface IComment {
    post: IPost,
    user: IUser,
    text: string,
    likes?: number,
    dislikes?: number,
    parentComment: IComment
}

const commentSchema = new Schema<IComment>({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'post',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'comment',
        default: null,
    },
    text: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export const commentModel = model('comment', commentSchema)